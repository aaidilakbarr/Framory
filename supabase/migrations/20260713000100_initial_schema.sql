begin;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  avatar_url text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_valid check (
    username = btrim(username)
    and char_length(username) between 1 and 50
  ),
  constraint profiles_avatar_url_length check (
    avatar_url is null or char_length(avatar_url) <= 2048
  ),
  constraint profiles_avatar_path_owned check (
    avatar_path is null
    or (
      char_length(avatar_path) <= 512
      and avatar_path like id::text || '/%'
    )
  )
);

create table public.albums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  cover_photo_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint albums_name_valid check (
    name = btrim(name)
    and char_length(name) between 1 and 100
  ),
  constraint albums_id_user_id_key unique (id, user_id)
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  album_id uuid,
  storage_path text not null,
  caption text not null default '',
  captured_at timestamptz not null,
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint photos_caption_length check (char_length(caption) <= 2000),
  constraint photos_storage_path_valid check (
    char_length(storage_path) between 39 and 512
    and storage_path like user_id::text || '/%'
  ),
  constraint photos_storage_path_key unique (storage_path),
  constraint photos_id_user_id_key unique (id, user_id),
  constraint photos_album_owner_fkey
    foreign key (album_id, user_id)
    references public.albums (id, user_id)
    on delete set null (album_id)
);

alter table public.albums
  add constraint albums_cover_photo_owner_fkey
  foreign key (cover_photo_id, user_id)
  references public.photos (id, user_id)
  on delete set null (cover_photo_id);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tags_name_valid check (
    name = btrim(name)
    and char_length(name) between 1 and 50
  ),
  constraint tags_id_user_id_key unique (id, user_id)
);

create table public.photo_tags (
  photo_id uuid not null,
  tag_id uuid not null,
  user_id uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (photo_id, tag_id),
  constraint photo_tags_photo_owner_fkey
    foreign key (photo_id, user_id)
    references public.photos (id, user_id)
    on delete cascade,
  constraint photo_tags_tag_owner_fkey
    foreign key (tag_id, user_id)
    references public.tags (id, user_id)
    on delete cascade
);

create table public.favorites (
  user_id uuid not null default auth.uid(),
  photo_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, photo_id),
  constraint favorites_photo_owner_fkey
    foreign key (photo_id, user_id)
    references public.photos (id, user_id)
    on delete cascade
);

create unique index albums_user_name_key
  on public.albums (user_id, lower(name));
create index albums_user_created_at_idx
  on public.albums (user_id, created_at desc);
create index albums_cover_photo_id_idx
  on public.albums (cover_photo_id)
  where cover_photo_id is not null;
create index albums_name_search_idx
  on public.albums using gin (lower(name) extensions.gin_trgm_ops);

create index photos_user_captured_at_idx
  on public.photos (user_id, captured_at desc, id);
create index photos_user_uploaded_at_idx
  on public.photos (user_id, uploaded_at desc, id);
create index photos_album_captured_at_idx
  on public.photos (album_id, captured_at desc, id)
  where album_id is not null;
create index photos_caption_search_idx
  on public.photos using gin (lower(caption) extensions.gin_trgm_ops);

create unique index tags_user_name_key
  on public.tags (user_id, lower(name));
create index tags_name_search_idx
  on public.tags using gin (lower(name) extensions.gin_trgm_ops);
create index photo_tags_user_tag_idx
  on public.photo_tags (user_id, tag_id, photo_id);
create index favorites_user_created_at_idx
  on public.favorites (user_id, created_at desc, photo_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger albums_set_updated_at
before update on public.albums
for each row execute function public.set_updated_at();

create trigger photos_set_updated_at
before update on public.photos
for each row execute function public.set_updated_at();

create trigger tags_set_updated_at
before update on public.tags
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_username text;
begin
  candidate_username := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'username'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(btrim(split_part(coalesce(new.email, ''), '@', 1)), ''),
    'StampCut user'
  );

  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    left(candidate_username, 50),
    left(nullif(btrim(new.raw_user_meta_data ->> 'avatar_url'), ''), 2048)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, username, avatar_url)
select
  users.id,
  left(
    coalesce(
      nullif(btrim(users.raw_user_meta_data ->> 'username'), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'name'), ''),
      nullif(btrim(split_part(coalesce(users.email, ''), '@', 1)), ''),
      'StampCut user'
    ),
    50
  ),
  left(nullif(btrim(users.raw_user_meta_data ->> 'avatar_url'), ''), 2048)
from auth.users as users
on conflict (id) do nothing;

create or replace function public.validate_album_cover()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.cover_photo_id is not null
     and not exists (
       select 1
       from public.photos as photo
       where photo.id = new.cover_photo_id
         and photo.user_id = new.user_id
         and photo.album_id = new.id
     ) then
    raise exception 'Album cover must be a photo in the same album'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger albums_validate_cover
before insert or update of cover_photo_id, user_id on public.albums
for each row execute function public.validate_album_cover();

create or replace function public.clear_album_cover_after_photo_move()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.album_id is distinct from new.album_id
     or old.user_id is distinct from new.user_id then
    update public.albums as album
       set cover_photo_id = null
     where album.cover_photo_id = new.id
       and (
         new.album_id is distinct from album.id
         or new.user_id is distinct from album.user_id
       );
  end if;

  return new;
end;
$$;

create trigger photos_clear_mismatched_album_cover
after update of album_id, user_id on public.photos
for each row execute function public.clear_album_cover_after_photo_move();

alter table public.profiles enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.tags enable row level security;
alter table public.photo_tags enable row level security;
alter table public.favorites enable row level security;

create policy profiles_select_own
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy profiles_insert_own
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy albums_select_own
on public.albums for select to authenticated
using ((select auth.uid()) = user_id);

create policy albums_insert_own
on public.albums for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy albums_update_own
on public.albums for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy albums_delete_own
on public.albums for delete to authenticated
using ((select auth.uid()) = user_id);

create policy photos_select_own
on public.photos for select to authenticated
using ((select auth.uid()) = user_id);

create policy photos_insert_own
on public.photos for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy photos_update_own
on public.photos for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy photos_delete_own
on public.photos for delete to authenticated
using ((select auth.uid()) = user_id);

create policy tags_select_own
on public.tags for select to authenticated
using ((select auth.uid()) = user_id);

create policy tags_insert_own
on public.tags for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy tags_update_own
on public.tags for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy tags_delete_own
on public.tags for delete to authenticated
using ((select auth.uid()) = user_id);

create policy photo_tags_select_own
on public.photo_tags for select to authenticated
using ((select auth.uid()) = user_id);

create policy photo_tags_insert_own
on public.photo_tags for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy photo_tags_delete_own
on public.photo_tags for delete to authenticated
using ((select auth.uid()) = user_id);

create policy favorites_select_own
on public.favorites for select to authenticated
using ((select auth.uid()) = user_id);

create policy favorites_insert_own
on public.favorites for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy favorites_delete_own
on public.favorites for delete to authenticated
using ((select auth.uid()) = user_id);

revoke all on table
  public.profiles,
  public.albums,
  public.photos,
  public.tags,
  public.photo_tags,
  public.favorites
from anon;

grant usage on schema public to authenticated;
grant select, insert on table public.profiles to authenticated;
grant update (username, avatar_url, avatar_path) on table public.profiles to authenticated;
grant select, insert, delete on table public.albums to authenticated;
grant update (name, cover_photo_id) on table public.albums to authenticated;
grant select, insert, delete on table public.photos to authenticated;
grant update (album_id, storage_path, caption, captured_at) on table public.photos to authenticated;
grant select, insert, delete on table public.tags to authenticated;
grant update (name) on table public.tags to authenticated;
grant select, insert, delete on table public.photo_tags to authenticated;
grant select, insert, delete on table public.favorites to authenticated;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.validate_album_cover() from public, anon, authenticated;
revoke execute on function public.clear_album_cover_after_photo_move() from public, anon, authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'memories',
    'memories',
    false,
    26214400,
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  ),
  (
    'avatars',
    'avatars',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy memories_select_own
on storage.objects for select to authenticated
using (
  bucket_id = 'memories'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy memories_insert_own
on storage.objects for insert to authenticated
with check (
  bucket_id = 'memories'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy memories_update_own
on storage.objects for update to authenticated
using (
  bucket_id = 'memories'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'memories'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy memories_delete_own
on storage.objects for delete to authenticated
using (
  bucket_id = 'memories'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy avatars_select_own
on storage.objects for select to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy avatars_insert_own
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy avatars_update_own
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy avatars_delete_own
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

commit;
