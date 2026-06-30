-- SQL Schema for ScoutHub Member Module

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for members (anggota)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gudep_name TEXT NOT NULL,          -- Connected to the active Pembina's school
    name TEXT NOT NULL,                -- Full name of member
    class TEXT NOT NULL,               -- Class (e.g. 7A, 8B, 9C)
    gender TEXT NOT NULL,              -- 'L' (Laki-laki) or 'P' (Perempuan)
    regu TEXT,                         -- Regu/group name (e.g. Elang, Mawar, Garuda)
    status TEXT NOT NULL DEFAULT 'Aktif', -- 'Aktif', 'Alumni', 'Cuti'
    notes TEXT,                        -- Optional additional info
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table for SKU Items
CREATE TABLE IF NOT EXISTS public.skus (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL DEFAULT 'Penggalang Ramu',
    point_number INTEGER NOT NULL,
    description TEXT NOT NULL
);

-- Table for Member SKU Progress
CREATE TABLE IF NOT EXISTS public.member_skus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    sku_id INTEGER NOT NULL REFERENCES public.skus(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Belum', -- 'Belum', 'Proses', 'Lulus', 'Revisi',
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(member_id, sku_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_skus ENABLE ROW LEVEL SECURITY;

-- Create policies for member management
CREATE POLICY "Enable all operations for authenticated users on members" 
ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create policies for skus management
CREATE POLICY "Enable select operations for authenticated users on skus" 
ON public.skus FOR SELECT TO authenticated USING (true);

-- Create policies for member_skus management
CREATE POLICY "Enable all operations for authenticated users on member_skus" 
ON public.member_skus FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed SKU Penggalang Ramu Items (30 Points)
INSERT INTO public.skus (category, point_number, description) VALUES
('Penggalang Ramu', 1, 'Selalu taat menjalankan ibadah agamanya secara pribadi maupun berjamaah.'),
('Penggalang Ramu', 2, 'Dapat memperingati hari-hari besar keagamaan di lingkungannya dan menghormati agama orang lain.'),
('Penggalang Ramu', 3, 'Mengikuti dan melaksanakan kegiatan keagamaan sesuai dengan agamanya.'),
('Penggalang Ramu', 4, 'Dapat menghafal dan menyanyikan Lagu Kebangsaan Indonesia Raya bait pertama di depan regunya.'),
('Penggalang Ramu', 5, 'Dapat menjelaskan sejarah dan makna Lambang Negara Republik Indonesia.'),
('Penggalang Ramu', 6, 'Dapat menjelaskan sejarah singkat Bendera Merah Putih dan tata cara penghormatannya.'),
('Penggalang Ramu', 7, 'Dapat menjelaskan sejarah singkat Gerakan Pramuka dan perkembangannya di Indonesia.'),
('Penggalang Ramu', 8, 'Dapat menjelaskan arti Lambang Gerakan Pramuka (Tunas Kelapa).'),
('Penggalang Ramu', 9, 'Dapat menjelaskan tingkatan dalam Gerakan Pramuka (Siaga, Penggalang, Penegak, Pandega).'),
('Penggalang Ramu', 10, 'Dapat menjelaskan Tri Satya dan Dasa Darma Pramuka Penggalang.'),
('Penggalang Ramu', 11, 'Dapat mempraktikkan sikap tegak, istirahat, hormat, lencang kanan, hadap kanan/kiri dalam PBB.'),
('Penggalang Ramu', 12, 'Dapat melakukan senam Pramuka atau senam kebugaran jasmani secara rutin.'),
('Penggalang Ramu', 13, 'Dapat menjelaskan jenis-jenis simpul dasar (mati, hidup, pangkal, tiang, jangkar).'),
('Penggalang Ramu', 14, 'Dapat mempraktikkan cara membuat tandu darurat menggunakan simpul kepramukaan.'),
('Penggalang Ramu', 15, 'Dapat mengirim dan menerima berita dengan sandi Morse menggunakan peluit atau bendera.'),
('Penggalang Ramu', 16, 'Dapat mengirim dan menerima berita dengan sandi Semaphore.'),
('Penggalang Ramu', 17, 'Dapat menjelaskan tanda-tanda jejak dasar dalam penjelajahan pramuka.'),
('Penggalang Ramu', 18, 'Dapat menggunakan kompas untuk menentukan 8 arah mata angin.'),
('Penggalang Ramu', 19, 'Dapat menjelaskan cara membaca peta pita dan membuat peta perjalanan sederhana.'),
('Penggalang Ramu', 20, 'Dapat menjelaskan isi kotak P3K dan cara menolong korban luka ringan.'),
('Penggalang Ramu', 21, 'Dapat menjelaskan cara menjaga kebersihan diri dan lingkungan sekitar.'),
('Penggalang Ramu', 22, 'Dapat mempraktikkan pengolahan sampah organik dan anorganik secara terpisah.'),
('Penggalang Ramu', 23, 'Dapat menyebutkan struktur pemerintahan dari tingkat RT, RW, Kelurahan hingga Kecamatan.'),
('Penggalang Ramu', 24, 'Dapat menjelaskan pentingnya menabung dan membuktikan kebiasaan menabung secara rutin.'),
('Penggalang Ramu', 25, 'Dapat menunjukkan hasil karya kerajinan tangan sederhana dari bahan bekas/daur ulang.'),
('Penggalang Ramu', 26, 'Dapat menyanyikan sedikitnya 3 lagu wajib nasional dan 3 lagu daerah.'),
('Penggalang Ramu', 27, 'Dapat menjelaskan hak-hak dasar anak (perlindungan, tumbuh kembang, dll).'),
('Penggalang Ramu', 28, 'Pernah mengikuti kegiatan bakti sosial di lingkungan tempat tinggal atau sekolah.'),
('Penggalang Ramu', 29, 'Dapat mendirikan tenda regu secara berkelompok bersama teman seregunya.'),
('Penggalang Ramu', 30, 'Mengetahui cara memasak air dan masakan sederhana di alam terbuka.')
ON CONFLICT DO NOTHING;
