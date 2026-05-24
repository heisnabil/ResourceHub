-- Tighten activity log visibility (employees see own activity only)

drop policy if exists "activity_select_authenticated" on public.activity_logs;

create policy "activity_select_scoped" on public.activity_logs
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.current_user_role() in ('manager', 'admin')
  );
