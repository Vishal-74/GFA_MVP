-- Supabase storage buckets configuration

-- Create exam-submissions bucket for video/text uploads
insert into storage.buckets (id, name, public)
values ('exam-submissions', 'exam-submissions', false);

-- Policy: Allow authenticated users to upload their own submissions
create policy "Users can upload exam submissions"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'exam-submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to read their own submissions
create policy "Users can read own submissions"
on storage.objects for select
to authenticated
using (
  bucket_id = 'exam-submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow admins to read all submissions (service role)
create policy "Service role can read all submissions"
on storage.objects for select
to service_role
using (bucket_id = 'exam-submissions');
