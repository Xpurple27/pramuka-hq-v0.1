-- =====================================================================
-- SCOUTHUB + ADM-PRAMUKA-V1 — SETUP SATU PROJECT SUPABASE
-- =====================================================================
-- Jalankan SETELAH supabase/schema.sql dan SEBELUM kedua file seed.
-- Script ini tidak menghapus atau memindahkan data lama.
--
-- Tujuan:
-- 1. mempertahankan tabel lama: peserta, jadwal, absensi, laporan,
--    dokumentasi;
-- 2. mengaktifkan RLS agar anon key tidak dapat membaca/menulis data lama;
-- 3. memberi akses kolaboratif ke tabel lama hanya bagi pengguna login;
-- 4. membuat profil ScoutHub untuk akun Auth yang sudah ada;
-- 5. mempertahankan akses foto publik, tetapi upload/perubahan/penghapusan
--    hanya untuk pengguna login.
-- =====================================================================

begin;

do $$
declare
  table_name text;
  policy_row record;
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Jalankan supabase/schema.sql milik ScoutHub terlebih dahulu';
  end if;

  foreach table_name in array array['peserta', 'jadwal', 'absensi', 'laporan', 'dokumentasi']
  loop
    if to_regclass(format('public.%I', table_name)) is null then
      raise exception 'Tabel lama public.% tidak ditemukan. Periksa project Supabase yang dipilih.', table_name;
    end if;

    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);

    -- Hapus policy lama yang secara eksplisit membuka akses kepada anon/public.
    for policy_row in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and (roles @> array['anon']::name[] or roles @> array['public']::name[])
    loop
      execute format('drop policy if exists %I on public.%I', policy_row.policyname, table_name);
    end loop;

    execute format('drop policy if exists %I on public.%I', 'shared_pramuka_authenticated', table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true)',
      'shared_pramuka_authenticated',
      table_name
    );
  end loop;
end;
$$;

-- Akun yang dibuat dari Adm-Pramuka-V1 menyimpan nama pada metadata "nama".
-- ScoutHub memakai "full_name". Backfill ini menerima keduanya tanpa
-- mengganti email, password, atau metadata akun yang sudah ada.
insert into public.profiles (id, full_name, email)
select
  user_row.id,
  coalesce(
    nullif(user_row.raw_user_meta_data ->> 'full_name', ''),
    nullif(user_row.raw_user_meta_data ->> 'nama', ''),
    split_part(coalesce(user_row.email, ''), '@', 1)
  ),
  user_row.email
from auth.users user_row
on conflict (id) do update set
  full_name = case
    when public.profiles.full_name = '' then excluded.full_name
    else public.profiles.full_name
  end,
  email = coalesce(public.profiles.email, excluded.email),
  updated_at = timezone('utc', now());

-- Pastikan akun baru dari kedua aplikasi selalu memperoleh profil ScoutHub.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'nama', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Bucket dokumentasi tetap public karena URL foto dipakai di tampilan dan PDF.
-- Operasi perubahan file tetap membutuhkan sesi authenticated.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dokumentasi',
  'dokumentasi',
  true,
  1048576,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "dokumentasi_storage_select" on storage.objects;
create policy "dokumentasi_storage_select"
  on storage.objects for select
  using (bucket_id = 'dokumentasi');

drop policy if exists "dokumentasi_storage_insert" on storage.objects;
drop policy if exists "dokumentasi_storage_insert_auth" on storage.objects;
create policy "dokumentasi_storage_insert_auth"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'dokumentasi');

drop policy if exists "dokumentasi_storage_update" on storage.objects;
drop policy if exists "dokumentasi_storage_update_auth" on storage.objects;
create policy "dokumentasi_storage_update_auth"
  on storage.objects for update to authenticated
  using (bucket_id = 'dokumentasi')
  with check (bucket_id = 'dokumentasi');

drop policy if exists "dokumentasi_storage_delete" on storage.objects;
drop policy if exists "dokumentasi_storage_delete_auth" on storage.objects;
create policy "dokumentasi_storage_delete_auth"
  on storage.objects for delete to authenticated
  using (bucket_id = 'dokumentasi');

commit;

-- Pemeriksaan setelah eksekusi:
-- select tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
--   and tablename in ('peserta','jadwal','absensi','laporan','dokumentasi');
