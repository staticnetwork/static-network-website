-- STATIC Social public media buckets.
-- Additive migration for the launch upload surface. This creates the storage
-- buckets the browser upload path expects and keeps object access scoped to
-- files stored under the signed-in user's id.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 12582912, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('banners', 'banners', true, 12582912, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  ('media', 'media', true, 125829120, array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'audio/aac',
    'audio/ogg',
    'audio/flac',
    'audio/aiff',
    'audio/x-aiff'
  ]),
  ('thumbnails', 'thumbnails', true, 12582912, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public STATIC media is readable" on storage.objects;
create policy "Public STATIC media is readable"
on storage.objects for select
using (bucket_id in ('avatars', 'banners', 'media', 'thumbnails'));

drop policy if exists "Users upload owned STATIC media" on storage.objects;
create policy "Users upload owned STATIC media"
on storage.objects for insert to authenticated
with check (
  bucket_id in ('avatars', 'banners', 'media', 'thumbnails')
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users update owned STATIC media" on storage.objects;
create policy "Users update owned STATIC media"
on storage.objects for update to authenticated
using (
  bucket_id in ('avatars', 'banners', 'media', 'thumbnails')
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id in ('avatars', 'banners', 'media', 'thumbnails')
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete owned STATIC media" on storage.objects;
create policy "Users delete owned STATIC media"
on storage.objects for delete to authenticated
using (
  bucket_id in ('avatars', 'banners', 'media', 'thumbnails')
  and (storage.foldername(name))[1] = auth.uid()::text
);
