-- Security: users cannot change their own role; inventory writes are admin-only

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "inventory_insert_manager_admin" on public.inventory;
drop policy if exists "inventory_update_manager_admin" on public.inventory;

create policy "inventory_insert_admin" on public.inventory
  for insert to authenticated
  with check (public.current_user_role() = 'admin');

create policy "inventory_update_admin" on public.inventory
  for update to authenticated
  using (public.current_user_role() = 'admin');

-- Optional: remove demo seed stock (skip this block if you want to keep existing requests)
-- Must delete requests first — inventory is referenced by requests.item_id (ON DELETE RESTRICT)
with seed_items as (
  select id from public.inventory
  where created_by is null
    and item_name in (
      'MacBook Pro 16"',
      'Dell UltraSharp 27"',
      'Microsoft 365 Business',
      'Dell OptiPlex Desktop',
      'Logitech MX Master 3S',
      'Keychron Q1 Keyboard',
      'LG 34" Ultrawide',
      'Adobe Creative Cloud'
    )
)
delete from public.requests
where item_id in (select id from seed_items);

with seed_items as (
  select id from public.inventory
  where created_by is null
    and item_name in (
      'MacBook Pro 16"',
      'Dell UltraSharp 27"',
      'Microsoft 365 Business',
      'Dell OptiPlex Desktop',
      'Logitech MX Master 3S',
      'Keychron Q1 Keyboard',
      'LG 34" Ultrawide',
      'Adobe Creative Cloud'
    )
)
delete from public.inventory
where id in (select id from seed_items);
