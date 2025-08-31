-- add creator_id (used by API/UI), backfill from author_id, and make users.name optional if present

-- Ensure issues.creator_id exists and is populated
alter table issues add column if not exists creator_id uuid;

-- Backfill creator_id from author_id if needed
update issues
   set creator_id = author_id
 where creator_id is null
   and author_id is not null;

-- Add helpful index for queries
create index if not exists idx_issues_creator_id on issues(creator_id);

-- Make creator_id required if possible (will fail only if rows remain null)
do $$
begin
  begin
    execute 'alter table issues alter column creator_id set not null';
  exception when others then
    -- ignore if cannot set not null due to legacy rows; can be handled manually later
    null;
  end;
end$$;

-- Drop old author_id column if it exists (schema now uses creator_id)
alter table issues drop column if exists author_id;

-- Relax users.name NOT NULL if that column exists (API does not require name)
do $$
begin
  if exists (
    select 1
      from information_schema.columns
     where table_name = 'users'
       and column_name = 'name'
  ) then
    begin
      execute 'alter table users alter column name drop not null';
    exception when others then
      null;
    end;
  end if;
end$$;
