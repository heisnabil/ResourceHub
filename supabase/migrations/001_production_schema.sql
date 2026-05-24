-- ResourceHub Production Schema
-- Run ONCE on a fresh Supabase project.
-- If you see "relation inventory already exists" → 001 is already applied.
-- Skip this file and run 002, 003, 004 instead (see supabase/schema.sql).

-- ─── Cleanup legacy tables (fresh projects may not have old names) ─
-- CASCADE drops triggers on these tables; do not DROP TRIGGER on missing tables.
drop table if exists public.activity_log cascade;
drop table if exists public.resource_requests cascade;
drop table if exists public.inventory_items cascade;
drop table if exists public.profiles cascade;

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.sync_inventory_status() cascade;
drop function if exists public.log_request_activity() cascade;
drop function if exists public.current_user_role() cascade;
drop function if exists public.process_item_request(uuid, uuid, text) cascade;
drop function if exists public.check_low_stock() cascade;
drop function if exists public.notify_managers_on_request() cascade;

-- ─── Extensions ──────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Profiles ──────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  avatar text,
  department text,
  role text not null default 'employee' check (role in ('employee', 'manager', 'admin')),
  created_at timestamptz not null default now()
);

-- ─── Inventory ─────────────────────────────────────────────────────
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  description text,
  category text not null check (category in ('laptop', 'monitor', 'software_license', 'desktop', 'accessories')),
  total_stock integer not null default 0 check (total_stock >= 0),
  available_stock integer not null default 0 check (available_stock >= 0),
  minimum_stock integer not null default 0 check (minimum_stock >= 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint available_lte_total check (available_stock <= total_stock)
);

-- ─── Requests ──────────────────────────────────────────────────────
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.inventory(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  attachment_path text,
  remarks text,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ─── Activity Logs ───────────────────────────────────────────────────
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ─── Notifications ───────────────────────────────────────────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── Monthly Reports ─────────────────────────────────────────────────
create table public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  generated_by uuid not null references public.profiles(id) on delete cascade,
  report_data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────
create index idx_requests_employee on public.requests(employee_id);
create index idx_requests_status on public.requests(status);
create index idx_requests_item on public.requests(item_id);
create index idx_requests_created on public.requests(created_at desc);
create index idx_inventory_category on public.inventory(category);
create index idx_activity_logs_created on public.activity_logs(created_at desc);
create index idx_notifications_user on public.notifications(user_id, is_read);
create index idx_profiles_role on public.profiles(role);

-- ─── Helpers ─────────────────────────────────────────────────────────
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ─── Auto profile on signup ──────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, avatar, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    new.email,
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    'employee'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Activity helper ─────────────────────────────────────────────────
create or replace function public.log_activity(
  p_user_id uuid,
  p_action text,
  p_metadata jsonb default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_logs (user_id, action, metadata)
  values (p_user_id, p_action, p_metadata);
end;
$$;

-- ─── Low stock detection ─────────────────────────────────────────────
create or replace function public.check_low_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.available_stock <= new.minimum_stock then
    perform public.log_activity(
      null,
      'low_stock_alert',
      jsonb_build_object(
        'item_id', new.id,
        'item_name', new.item_name,
        'available_stock', new.available_stock,
        'minimum_stock', new.minimum_stock
      )
    );

    insert into public.notifications (user_id, title, message)
    select
      p.id,
      'Low Stock Alert',
      new.item_name || ' is low (' || new.available_stock || '/' || new.minimum_stock || ')'
    from public.profiles p
    where p.role in ('manager', 'admin');
  end if;
  return new;
end;
$$;

create trigger inventory_low_stock_check
  after insert or update of available_stock on public.inventory
  for each row execute function public.check_low_stock();

-- ─── Notify managers on new request ──────────────────────────────────
create or replace function public.notify_managers_on_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item_name text;
  v_employee_name text;
begin
  select item_name into v_item_name from public.inventory where id = new.item_id;
  select name into v_employee_name from public.profiles where id = new.employee_id;

  perform public.log_activity(
    new.employee_id,
    'request_submitted',
    jsonb_build_object(
      'request_id', new.id,
      'item_id', new.item_id,
      'quantity', new.quantity
    )
  );

  insert into public.notifications (user_id, title, message)
  select
    p.id,
    'New Resource Request',
    coalesce(v_employee_name, 'An employee') || ' requested ' || coalesce(v_item_name, 'an item') || ' (x' || new.quantity || ')'
  from public.profiles p
  where p.role in ('manager', 'admin');

  return new;
end;
$$;

create trigger request_created_notify
  after insert on public.requests
  for each row execute function public.notify_managers_on_request();

-- ─── Transaction: process_item_request ─────────────────────────────
create or replace function public.process_item_request(
  p_request_id uuid,
  p_approver_id uuid,
  p_action text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.requests%rowtype;
  v_inventory public.inventory%rowtype;
  v_approver_role text;
  v_item_name text;
  v_employee_id uuid;
begin
  if p_action not in ('approve', 'reject') then
    raise exception 'INVALID_ACTION: Must be approve or reject';
  end if;

  select role into v_approver_role
  from public.profiles
  where id = p_approver_id;

  if v_approver_role is null or v_approver_role not in ('manager', 'admin') then
    raise exception 'FORBIDDEN: Only managers and admins can process requests';
  end if;

  select * into v_request
  from public.requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'REQUEST_NOT_FOUND';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'REQUEST_ALREADY_PROCESSED';
  end if;

  v_employee_id := v_request.employee_id;

  select item_name into v_item_name
  from public.inventory
  where id = v_request.item_id;

  if p_action = 'reject' then
    update public.requests
    set status = 'rejected', approved_by = p_approver_id
    where id = p_request_id;

    perform public.log_activity(
      p_approver_id,
      'request_rejected',
      jsonb_build_object('request_id', p_request_id, 'item_id', v_request.item_id)
    );

    insert into public.notifications (user_id, title, message)
    values (
      v_employee_id,
      'Request Rejected',
      'Your request for ' || coalesce(v_item_name, 'an item') || ' was rejected.'
    );

    return jsonb_build_object('status', 'rejected', 'request_id', p_request_id);
  end if;

  -- APPROVE: lock inventory row
  select * into v_inventory
  from public.inventory
  where id = v_request.item_id
  for update;

  if not found then
    raise exception 'INVENTORY_NOT_FOUND';
  end if;

  if v_inventory.available_stock < v_request.quantity then
    raise exception 'INSUFFICIENT_STOCK: Available %, requested %',
      v_inventory.available_stock, v_request.quantity;
  end if;

  update public.inventory
  set available_stock = available_stock - v_request.quantity
  where id = v_request.item_id;

  update public.requests
  set status = 'approved', approved_by = p_approver_id
  where id = p_request_id;

  perform public.log_activity(
    p_approver_id,
    'request_approved',
    jsonb_build_object(
      'request_id', p_request_id,
      'item_id', v_request.item_id,
      'quantity', v_request.quantity
    )
  );

  insert into public.notifications (user_id, title, message)
  values (
    v_employee_id,
    'Request Approved',
    'Your request for ' || coalesce(v_item_name, 'an item') || ' (x' || v_request.quantity || ') was approved.'
  );

  return jsonb_build_object(
    'status', 'approved',
    'request_id', p_request_id,
    'remaining_stock', v_inventory.available_stock - v_request.quantity
  );
exception
  when others then
    raise;
end;
$$;

-- ─── Dashboard stats function ────────────────────────────────────────
create or replace function public.get_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role text;
  v_pending integer;
  v_approved integer;
  v_inventory_count integer;
  v_low_stock integer;
begin
  v_role := public.current_user_role();

  if v_role in ('manager', 'admin') then
    select count(*) into v_pending from public.requests where status = 'pending';
    select count(*) into v_approved from public.requests where status = 'approved';
  else
    select count(*) into v_pending from public.requests where status = 'pending' and employee_id = auth.uid();
    select count(*) into v_approved from public.requests where status = 'approved' and employee_id = auth.uid();
  end if;

  select count(*) into v_inventory_count from public.inventory;
  select count(*) into v_low_stock from public.inventory where available_stock <= minimum_stock;

  return jsonb_build_object(
    'pending_requests', v_pending,
    'approved_requests', v_approved,
    'inventory_count', v_inventory_count,
    'low_stock_count', v_low_stock
  );
end;
$$;

-- ─── Row Level Security ──────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.inventory enable row level security;
alter table public.requests enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.monthly_reports enable row level security;

-- Profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_select_manager_admin" on public.profiles for select using (public.current_user_role() in ('manager', 'admin'));
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update using (public.current_user_role() = 'admin');

-- Inventory: all authenticated read; manager/admin write
create policy "inventory_select_authenticated" on public.inventory for select to authenticated using (true);
create policy "inventory_insert_manager_admin" on public.inventory for insert to authenticated
  with check (public.current_user_role() in ('manager', 'admin'));
create policy "inventory_update_manager_admin" on public.inventory for update to authenticated
  using (public.current_user_role() in ('manager', 'admin'));
create policy "inventory_delete_admin" on public.inventory for delete to authenticated
  using (public.current_user_role() = 'admin');

-- Requests
create policy "requests_select_own" on public.requests for select using (employee_id = auth.uid());
create policy "requests_select_manager_admin" on public.requests for select using (public.current_user_role() in ('manager', 'admin'));
create policy "requests_insert_own" on public.requests for insert to authenticated with check (employee_id = auth.uid());
create policy "requests_update_manager_admin" on public.requests for update to authenticated
  using (public.current_user_role() in ('manager', 'admin'));

-- Activity logs
create policy "activity_select_authenticated" on public.activity_logs for select to authenticated using (true);

-- Notifications
create policy "notifications_select_own" on public.notifications for select using (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications for update using (user_id = auth.uid());

-- Monthly reports
create policy "reports_select_manager_admin" on public.monthly_reports for select
  using (public.current_user_role() in ('manager', 'admin'));
create policy "reports_insert_manager_admin" on public.monthly_reports for insert to authenticated
  with check (public.current_user_role() in ('manager', 'admin') and generated_by = auth.uid());

-- ─── Storage: request-receipts bucket ────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'request-receipts',
  'request-receipts',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

create policy "receipts_upload_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'request-receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "receipts_read_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'request-receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "receipts_read_manager_admin"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'request-receipts'
    and public.current_user_role() in ('manager', 'admin')
  );

-- ─── Grants ──────────────────────────────────────────────────────────
grant execute on function public.process_item_request(uuid, uuid, text) to authenticated;
grant execute on function public.get_dashboard_stats() to authenticated;
grant execute on function public.log_activity(uuid, text, jsonb) to authenticated;

-- Inventory starts empty — admins add items via /admin/login → Inventory

-- ─── Backfill profiles (users who signed in before this migration) ───
insert into public.profiles (id, name, email, avatar, role)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1)
  ),
  u.email,
  coalesce(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  ),
  'employee'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
