-- TEMPLATE AWAL, BUKAN TRANSKRIP RESMI SKU.
-- Ganti dengan daftar butir resmi yang digunakan gudep Anda sebelum pilot.
insert into public.sku_items (level, category, item_number, title, description) values
('Penggalang Ramu', 'Spiritual', 1, 'Ketaatan beribadah', 'Membiasakan ibadah sesuai agama dan keyakinan masing-masing.'),
('Penggalang Ramu', 'Kebangsaan', 2, 'Tri Satya dan Dasa Darma', 'Menjelaskan serta menerapkan nilai Tri Satya dan Dasa Darma.'),
('Penggalang Ramu', 'Teknik Kepramukaan', 3, 'Simpul dasar', 'Mempraktikkan simpul dasar sesuai kebutuhan kegiatan.'),
('Penggalang Ramu', 'Teknik Kepramukaan', 4, 'Arah mata angin', 'Menentukan arah mata angin menggunakan kompas.'),
('Penggalang Ramu', 'Kesehatan', 5, 'Pertolongan pertama', 'Menjelaskan tindakan awal untuk cedera ringan.'),
('Penggalang Rakit', 'Kepemimpinan', 1, 'Memimpin regu', 'Mempraktikkan kepemimpinan sederhana dalam kegiatan regu.'),
('Penggalang Rakit', 'Teknik Kepramukaan', 2, 'Pionering', 'Membuat konstruksi pionering sederhana secara beregu.'),
('Penggalang Rakit', 'Komunikasi', 3, 'Sandi dan isyarat', 'Mengirim dan menerima pesan menggunakan sandi atau isyarat.'),
('Penggalang Terap', 'Kepemimpinan', 1, 'Merencanakan kegiatan', 'Menyusun rencana kegiatan regu dan membagi peran.'),
('Penggalang Terap', 'Pengabdian', 2, 'Bakti masyarakat', 'Berpartisipasi aktif dalam kegiatan pengabdian di lingkungan.')
on conflict (level, item_number) do nothing;
