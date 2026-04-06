-- Helper functions for role checks in RLS policies.
-- Note: uses profiles.role; default is 'student'.

create or replace function has_role(target_role text)
returns boolean
language sql stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = target_role
  );
$$;

