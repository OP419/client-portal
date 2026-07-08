-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run

-- One row per client/company
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Links a logged-in user (Supabase auth user) to a client/company
create table client_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade
);

-- The reports/deliverables themselves
create table files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  description text,
  storage_path text not null, -- path inside the "client-files" storage bucket
  created_at timestamptz default now()
);

-- Row Level Security: users can only ever see rows for their own client_id.
-- This is enforced by the database itself, not just hidden in the UI.
alter table clients enable row level security;
alter table client_users enable row level security;
alter table files enable row level security;

create policy "users see their own client_users row"
  on client_users for select
  using (auth.uid() = user_id);

create policy "users see their own client"
  on clients for select
  using (
    id in (select client_id from client_users where user_id = auth.uid())
  );

create policy "users see their own client's files"
  on files for select
  using (
    client_id in (select client_id from client_users where user_id = auth.uid())
  );

-- Storage: create a bucket called "client-files" (do this in the Storage tab,
-- not here), keep it PRIVATE, and add this policy so users can only download
-- files that belong to their own client (matched by folder name = client_id).
-- Example storage_path to use when uploading a file for a client:
--   <client_id>/2026-07-report.pdf
create policy "users read their own client's storage files"
  on storage.objects for select
  using (
    bucket_id = 'client-files'
    and (storage.foldername(name))[1] in (
      select client_id::text from client_users where user_id = auth.uid()
    )
  );
