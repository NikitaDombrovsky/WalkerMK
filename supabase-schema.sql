create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[0-9]{4}$'),
  title text not null,
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'lobby' check (status in ('lobby', 'question', 'review', 'finished')),
  board_size integer not null default 89 check (board_size > 0),
  first_correct_bonus integer not null default 1 check (first_correct_bonus >= 0),
  active_question_id uuid,
  active_question_prompt text,
  active_question_points integer default 0,
  winner_snapshot jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  display_name text not null,
  score integer not null default 0 check (score >= 0),
  position integer not null default 0 check (position >= 0),
  joined_at timestamptz not null default now()
);

create unique index if not exists room_players_room_name_uidx
  on public.room_players (room_id, lower(display_name));

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  prompt text not null,
  answer text not null,
  points integer not null default 1 check (points > 0),
  sort_order integer not null default 0,
  is_used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  player_id uuid not null references public.room_players(id) on delete cascade,
  answer_text text not null,
  normalized_answer text not null,
  is_correct boolean,
  awarded_points integer not null default 0 check (awarded_points >= 0),
  bonus_points integer not null default 0 check (bonus_points >= 0),
  submitted_at timestamptz not null default now(),
  unique (question_id, player_id)
);

create or replace function public.enforce_room_player_limit()
returns trigger
language plpgsql
as $$
begin
  if (
    select count(*)
    from public.room_players
    where room_id = new.room_id
  ) >= 11 then
    raise exception 'Room is full';
  end if;

  return new;
end;
$$;

drop trigger if exists room_player_limit_trigger on public.room_players;
create trigger room_player_limit_trigger
before insert on public.room_players
for each row
execute function public.enforce_room_player_limit();

alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;

drop policy if exists "admins_manage_rooms" on public.rooms;
create policy "admins_manage_rooms"
on public.rooms
for all
to authenticated
using (auth.uid() = admin_user_id)
with check (auth.uid() = admin_user_id);

drop policy if exists "public_can_read_rooms" on public.rooms;
create policy "public_can_read_rooms"
on public.rooms
for select
to anon, authenticated
using (true);

drop policy if exists "admins_manage_room_players" on public.room_players;
create policy "admins_manage_room_players"
on public.room_players
for all
to authenticated
using (
  exists (
    select 1
    from public.rooms
    where rooms.id = room_players.room_id
      and rooms.admin_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.rooms
    where rooms.id = room_players.room_id
      and rooms.admin_user_id = auth.uid()
  )
);

drop policy if exists "students_join_room" on public.room_players;
create policy "students_join_room"
on public.room_players
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.rooms
    where rooms.id = room_players.room_id
      and rooms.status in ('lobby', 'question', 'review')
  )
);

drop policy if exists "public_can_read_room_players" on public.room_players;
create policy "public_can_read_room_players"
on public.room_players
for select
to anon, authenticated
using (true);

drop policy if exists "admins_manage_questions" on public.questions;
create policy "admins_manage_questions"
on public.questions
for all
to authenticated
using (
  exists (
    select 1
    from public.rooms
    where rooms.id = questions.room_id
      and rooms.admin_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.rooms
    where rooms.id = questions.room_id
      and rooms.admin_user_id = auth.uid()
  )
);

drop policy if exists "admins_manage_answers" on public.answers;
create policy "admins_manage_answers"
on public.answers
for all
to authenticated
using (
  exists (
    select 1
    from public.rooms
    where rooms.id = answers.room_id
      and rooms.admin_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.rooms
    where rooms.id = answers.room_id
      and rooms.admin_user_id = auth.uid()
  )
);

drop policy if exists "students_submit_answers" on public.answers;
create policy "students_submit_answers"
on public.answers
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.rooms
    where rooms.id = answers.room_id
      and rooms.active_question_id = answers.question_id
      and rooms.status = 'question'
  )
);

drop policy if exists "students_read_own_answers_for_active_room" on public.answers;
create policy "students_read_own_answers_for_active_room"
on public.answers
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.rooms
    where rooms.id = answers.room_id
      and rooms.status in ('question', 'review', 'finished', 'lobby')
  )
);

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'rooms'
      and constraint_name = 'rooms_active_question_id_fkey'
  ) then
    alter table public.rooms
      drop constraint rooms_active_question_id_fkey;
  end if;
end
$$;

alter table public.rooms
  add constraint rooms_active_question_id_fkey
  foreign key (active_question_id) references public.questions(id)
  on delete set null;

create or replace view public.public_room_state
as
select
  id,
  code,
  title,
  status,
  board_size,
  first_correct_bonus,
  active_question_id,
  active_question_prompt,
  active_question_points,
  winner_snapshot,
  created_at,
  finished_at
from public.rooms;

create or replace view public.public_room_players
as
select
  id,
  room_id,
  display_name,
  score,
  position,
  joined_at
from public.room_players;

grant select on public.public_room_state to anon, authenticated;
grant select on public.public_room_players to anon, authenticated;
