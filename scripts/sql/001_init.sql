-- Enable uuid generation if available
create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  role text not null check (role in ('admin','user')),
  created_at timestamptz not null default now()
);

create table if not exists issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  status text not null default 'open' check (status in ('open','closed')),
  author_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_issues_status_created_at on issues(status, created_at desc);
create index if not exists idx_issues_author_id on issues(author_id);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_comments_issue_id on comments(issue_id);
create index if not exists idx_comments_author_id on comments(author_id);
