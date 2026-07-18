# ScoutHub v1

ScoutHub adalah sistem operasional pembinaan pramuka di tingkat sekolah dan gugus depan. Aplikasi membantu pembina mengelola gudep, anggota, regu, latihan, absensi, progress SKU dan SKK Penggalang, dashboard, serta laporan dari satu tempat.

## Fitur

- Registrasi, login, logout, lupa kata sandi, dan proteksi halaman.
- Multi-gudep per akun dengan pemilihan gudep aktif.
- CRUD anggota, pencarian, status, tingkat SKU, dan penempatan regu.
- CRUD regu, pemimpin/wakil, warna, jenis, dan jumlah anggota.
- Jadwal serta riwayat latihan lengkap dengan materi dan evaluasi.
- Absensi massal per pertemuan: Hadir, Izin, Sakit, atau Alpa.
- Tracker 90 butir SKU resmi Penggalang Ramu, Rakit, dan Terap.
- Tracker 81 jenis SKK Penggalang dalam lima bidang, lengkap dengan jenjang Purwa, Madya, dan Utama.
- Dashboard berbasis data nyata, tanpa angka contoh.
- Ekspor anggota, latihan, absensi, SKU, dan SKK ke CSV/Excel.
- Tampilan responsif, installable PWA, dan mode cetak/PDF.
- Row Level Security yang memisahkan data antar akun/gudep.

## Teknologi

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.
- Supabase Auth dan PostgreSQL.
- Vercel untuk deployment.

## Menjalankan secara lokal

Prasyarat: Node.js 20 atau lebih baru dan sebuah project Supabase.

1. Jalankan `npm install`.
2. Salin `.env.example` menjadi `.env.local`, lalu isi:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-public-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   Jangan pernah menaruh `service_role` key di aplikasi frontend atau GitHub.

3. Buka Supabase **SQL Editor** dan jalankan [`supabase/schema.sql`](supabase/schema.sql).
4. Jalankan [`supabase/seed_sku_penggalang.sql`](supabase/seed_sku_penggalang.sql) untuk mengisi 90 butir SKU resmi.
5. Jalankan [`supabase/seed_skk_penggalang.sql`](supabase/seed_skk_penggalang.sql) untuk mengisi 81 jenis SKK beserta 243 persyaratan tingkatnya.
6. Jalankan `npm run dev`, lalu buka `http://localhost:3000`.
7. Daftar sebagai pembina, buat gudep, lalu isi data dari menu dashboard.

## Konfigurasi Supabase Auth

Pada **Authentication → URL Configuration**:

- Site URL lokal: `http://localhost:3000`
- Redirect URL lokal: `http://localhost:3000/**`
- Setelah deployment, tambahkan `https://domain-vercel-anda.vercel.app/**`

Konfirmasi email boleh tetap aktif. Untuk pilot internal, akun pembina juga dapat dibuat manual melalui dashboard Supabase.

## Deployment Vercel

1. Import repositori ini di Vercel.
2. Tambahkan tiga environment variables dari `.env.example`.
3. Ubah `NEXT_PUBLIC_SITE_URL` menjadi URL produksi.
4. Deploy, lalu tambahkan URL produksi ke redirect URL Supabase Auth.
5. Uji register/login, isolasi dua akun, CRUD, absensi, SKU, SKK, ekspor, dan instalasi PWA.

## Pemeriksaan

```bash
npm run lint
npm run typecheck
npm run build
```

Atau jalankan semuanya sekaligus dengan `npm run check`.

## Keamanan dan data

- Semua data operasional memakai RLS dan hanya dapat diakses pemilik gudep.
- Anon key aman berada di frontend selama RLS tetap aktif.
- Penghapusan gudep menghapus data turunannya melalui foreign key `ON DELETE CASCADE`.
- Jangan menjalankan skema ini di database lama yang strukturnya berbeda tanpa backup dan migrasi.

## Struktur penting

```text
src/app/dashboard/        halaman seluruh modul
src/app/actions/          autentikasi dan server actions CRUD
src/components/dashboard komponen manajemen dan layout
src/lib/                  konteks gudep aktif
src/utils/supabase/       koneksi browser/server dan refresh session
supabase/schema.sql       tabel, relasi, index, trigger, dan RLS
supabase/seed_sku_penggalang.sql 90 butir SKU Penggalang
supabase/seed_skk_penggalang.sql 81 SKK dan 243 persyaratan tingkat
public/sw.js              service worker PWA
```

## Sumber materi kecakapan

- SKU: *Panduan Penyelesaian Syarat Kecakapan Umum Pramuka Golongan Penggalang*, Keputusan Kwarnas Nomor 198 dan 199 Tahun 2011.
- SKK: Keputusan Kwarnas Gerakan Pramuka Nomor 132 Tahun 1979. Seed hanya memuat persyaratan yang berlaku bagi Penggalang; SKK khusus Siaga dan tambahan khusus Penegak/Pandega tidak dimasukkan.
