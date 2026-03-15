insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
values ('project-video', 'project-video', true, array['video/mp4'], 16777216)
on conflict (id) do update
set public = excluded.public,
    allowed_mime_types = excluded.allowed_mime_types,
    file_size_limit = excluded.file_size_limit;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated can manage project videos'
  ) then
    create policy "Authenticated can manage project videos"
    on storage.objects
    for all
    to authenticated
    using (bucket_id = 'project-video')
    with check (bucket_id = 'project-video');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can view project videos'
  ) then
    create policy "Public can view project videos"
    on storage.objects
    for select
    to public
    using (bucket_id = 'project-video');
  end if;
end
$$;
