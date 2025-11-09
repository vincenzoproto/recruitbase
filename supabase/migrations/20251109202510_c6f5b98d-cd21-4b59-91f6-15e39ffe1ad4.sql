-- Create public storage buckets for avatars and chat media
-- Buckets
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

insert into storage.buckets (id, name, public)
values
  ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for avatars bucket
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policies for chat-media bucket
create policy "Chat media are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'chat-media');

create policy "Users can upload chat media in their folder"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own chat media"
  on storage.objects for update
  using (
    bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own chat media"
  on storage.objects for delete
  using (
    bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]
  );