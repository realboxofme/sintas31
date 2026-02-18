-- =============================================
-- SINTAS Database Schema for PostgreSQL (Supabase)
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'staff',
    jabatan TEXT,
    nip TEXT,
    phone TEXT,
    avatar TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 2. KATEGORI SURAT TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS "KategoriSurat" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    kode TEXT UNIQUE NOT NULL,
    keterangan TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 3. SURAT MASUK TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS "SuratMasuk" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "noSurat" TEXT NOT NULL,
    "tanggalSurat" TIMESTAMP NOT NULL,
    "tanggalTerima" TIMESTAMP DEFAULT NOW(),
    pengirim TEXT NOT NULL,
    perihal TEXT NOT NULL,
    lampiran TEXT,
    sifat TEXT DEFAULT 'Biasa',
    status TEXT DEFAULT 'Baru',
    keterangan TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "kategoriId" TEXT REFERENCES "KategoriSurat"(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 4. SURAT KELUAR TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS "SuratKeluar" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "noSurat" TEXT NOT NULL,
    "tanggalSurat" TIMESTAMP DEFAULT NOW(),
    tujuan TEXT NOT NULL,
    perihal TEXT NOT NULL,
    lampiran TEXT,
    sifat TEXT DEFAULT 'Biasa',
    status TEXT DEFAULT 'Draft',
    keterangan TEXT,
    "fileUrl" TEXT,
    "isiSurat" TEXT,
    "kategoriId" TEXT REFERENCES "KategoriSurat"(id) ON DELETE SET NULL,
    "createdBy" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 5. DISPOSISI TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS "Disposisi" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "suratMasukId" TEXT NOT NULL REFERENCES "SuratMasuk"(id) ON DELETE CASCADE,
    "dariUserId" TEXT NOT NULL REFERENCES "User"(id),
    "keUserId" TEXT,
    tujuan TEXT NOT NULL,
    instruksi TEXT NOT NULL,
    status TEXT DEFAULT 'Belum Diproses',
    "tenggatWaktu" TIMESTAMP,
    catatan TEXT,
    prioritas TEXT DEFAULT 'Normal',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 6. ARSIP TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS "Arsip" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "noArsip" TEXT UNIQUE NOT NULL,
    "tanggalArsip" TIMESTAMP DEFAULT NOW(),
    keterangan TEXT,
    lokasi TEXT,
    jenis TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "suratMasukId" TEXT UNIQUE REFERENCES "SuratMasuk"(id) ON DELETE SET NULL,
    "suratKeluarId" TEXT UNIQUE REFERENCES "SuratKeluar"(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 7. TEMPLATE SURAT TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS "TemplateSurat" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    kode TEXT UNIQUE NOT NULL,
    konten TEXT NOT NULL,
    "kategoriId" TEXT REFERENCES "KategoriSurat"(id) ON DELETE SET NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 8. LOG AKTIVITAS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS "LogAktivitas" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT,
    aksi TEXT NOT NULL,
    entitas TEXT NOT NULL,
    "entitasId" TEXT,
    detail TEXT,
    ip TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR BETTER PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_surat_masuk_kategori ON "SuratMasuk"("kategoriId");
CREATE INDEX IF NOT EXISTS idx_surat_masuk_status ON "SuratMasuk"(status);
CREATE INDEX IF NOT EXISTS idx_surat_masuk_tanggal ON "SuratMasuk"("tanggalTerima");

CREATE INDEX IF NOT EXISTS idx_surat_keluar_kategori ON "SuratKeluar"("kategoriId");
CREATE INDEX IF NOT EXISTS idx_surat_keluar_status ON "SuratKeluar"(status);
CREATE INDEX IF NOT EXISTS idx_surat_keluar_created ON "SuratKeluar"("createdBy");

CREATE INDEX IF NOT EXISTS idx_disposisi_surat ON "Disposisi"("suratMasukId");
CREATE INDEX IF NOT EXISTS idx_disposisi_user ON "Disposisi"("dariUserId");
CREATE INDEX IF NOT EXISTS idx_disposisi_status ON "Disposisi"(status);

CREATE INDEX IF NOT EXISTS idx_arsip_jenis ON "Arsip"(jenis);
CREATE INDEX IF NOT EXISTS idx_arsip_tanggal ON "Arsip"("tanggalArsip");

-- =============================================
-- SEED DATA: KATEGORI
-- =============================================
INSERT INTO "KategoriSurat" (id, nama, kode, keterangan) VALUES
    (gen_random_uuid(), 'Umum', 'UMM', 'Surat Umum'),
    (gen_random_uuid(), 'Kepegawaian', 'KEP', 'Surat Kepegawaian'),
    (gen_random_uuid(), 'Keuangan', 'KEU', 'Surat Keuangan'),
    (gen_random_uuid(), 'Undangan', 'UND', 'Surat Undangan'),
    (gen_random_uuid(), 'Pengadaan', 'PGD', 'Surat Pengadaan'),
    (gen_random_uuid(), 'Perizinan', 'PRZ', 'Surat Perizinan'),
    (gen_random_uuid(), 'Laporan', 'LAP', 'Surat Laporan'),
    (gen_random_uuid(), 'Lainnya', 'LIN', 'Surat Lainnya')
ON CONFLICT (kode) DO NOTHING;

-- =============================================
-- SEED DATA: ADMIN USER
-- Password: admin123 (bcrypt hash)
-- =============================================
INSERT INTO "User" (id, email, password, name, role, jabatan, nip, "isActive") VALUES
    (
        gen_random_uuid(),
        'admin@sintas.go.id',
        '$2a$10$EqKcp1WFKVQISheBxkV3FeYMmM8sOBfKLOlLGiXHqXJYQXJPZK3Hi',
        'Administrator',
        'admin',
        'Kepala Bagian Administrasi',
        '198501152010011001',
        true
    )
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- SEED DATA: TEMPLATE SURAT
-- =============================================
INSERT INTO "TemplateSurat" (id, nama, kode, konten, "isActive") VALUES
    (
        gen_random_uuid(),
        'Surat Keterangan',
        'TMPL-SK',
        '<div style="text-align: center; margin-bottom: 30px;">
<h2 style="margin-bottom: 5px;">SURAT KETERANGAN</h2>
<p>Nomor: [NOMOR_SURAT]</p>
</div>
<p style="margin-bottom: 20px;">Yang bertanda tangan di bawah ini, Kepala Dinas [NAMA_DINAS] menerangkan bahwa:</p>
<table style="margin-bottom: 20px;">
<tr><td style="width: 150px;">Nama</td><td>: [NAMA]</td></tr>
<tr><td>NIK</td><td>: [NIK]</td></tr>
<tr><td>Tempat/Tgl Lahir</td><td>: [TEMPAT_LAHIR], [TANGGAL_LAHIR]</td></tr>
<tr><td>Alamat</td><td>: [ALAMAT]</td></tr>
</table>
<p style="margin-bottom: 20px;">Adalah benar warga yang berdomisili di wilayah kerja Dinas [NAMA_DINAS].</p>
<p style="margin-bottom: 40px;">Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
<div style="text-align: right;">
<p>[KOTA], [TANGGAL]</p>
<p style="margin-top: 60px;">[NAMA_PEJABAT]</p>
<p>[JABATAN]</p>
</div>',
        true
    ),
    (
        gen_random_uuid(),
        'Surat Undangan',
        'TMPL-SU',
        '<div style="text-align: center; margin-bottom: 30px;">
<h2 style="margin-bottom: 5px;">SURAT UNDANGAN</h2>
<p>Nomor: [NOMOR_SURAT]</p>
</div>
<p style="margin-bottom: 20px;">Kepada Yth.<br/>[NAMA_PENERIMA]<br/>[JABATAN/INSTANSI]<br/>di [TEMPAT]</p>
<p style="margin-bottom: 20px;">Dengan hormat,</p>
<p style="margin-bottom: 20px;">Dengan ini kami mengundang Bapak/Ibu untuk menghadiri:</p>
<table style="margin-bottom: 20px;">
<tr><td style="width: 150px;">Acara</td><td>: [NAMA_ACARA]</td></tr>
<tr><td>Hari/Tanggal</td><td>: [HARI], [TANGGAL]</td></tr>
<tr><td>Waktu</td><td>: [WAKTU] WIB</td></tr>
<tr><td>Tempat</td><td>: [TEMPAT]</td></tr>
</table>
<p style="margin-bottom: 40px;">Demikian surat undangan ini kami sampaikan. Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.</p>
<div style="text-align: right;">
<p>[KOTA], [TANGGAL]</p>
<p style="margin-top: 60px;">[NAMA_PEJABAT]</p>
<p>[JABATAN]</p>
</div>',
        true
    ),
    (
        gen_random_uuid(),
        'Surat Perintah',
        'TMPL-SP',
        '<div style="text-align: center; margin-bottom: 30px;">
<h2 style="margin-bottom: 5px;">SURAT PERINTAH</h2>
<p>Nomor: [NOMOR_SURAT]</p>
</div>
<p style="margin-bottom: 10px;">Yang bertanda tangan di bawah ini:</p>
<table style="margin-bottom: 20px;">
<tr><td style="width: 150px;">Nama</td><td>: [NAMA_PEJABAT]</td></tr>
<tr><td>Jabatan</td><td>: [JABATAN_PEJABAT]</td></tr>
<tr><td>NIP</td><td>: [NIP_PEJABAT]</td></tr>
</table>
<p style="margin-bottom: 20px;">Memerintahkan kepada:</p>
<table style="margin-bottom: 20px;">
<tr><td style="width: 150px;">Nama</td><td>: [NAMA]</td></tr>
<tr><td>Jabatan</td><td>: [JABATAN]</td></tr>
<tr><td>NIP</td><td>: [NIP]</td></tr>
</table>
<p style="margin-bottom: 20px;">Untuk: [ISI_PERINTAH]</p>
<p style="margin-bottom: 40px;">Demikian surat perintah ini dibuat untuk dilaksanakan dengan penuh tanggung jawab.</p>
<div style="text-align: right;">
<p>[KOTA], [TANGGAL]</p>
<p style="margin-top: 60px;">[NAMA_PEJABAT]</p>
<p>[JABATAN_PEJABAT]</p>
</div>',
        true
    )
ON CONFLICT (kode) DO NOTHING;

-- =============================================
-- SEED DATA: SAMPLE SURAT MASUK
-- =============================================
INSERT INTO "SuratMasuk" (id, "noSurat", "tanggalSurat", "tanggalTerima", pengirim, perihal, lampiran, sifat, status, keterangan)
SELECT 
    gen_random_uuid(),
    '001/DINAS/I/2025',
    '2025-01-15',
    '2025-01-16',
    'Dinas Pendidikan Kota Bandung',
    'Undangan Rapat Koordinasi Program Sekolah',
    '1 berkas',
    'Segera',
    'Baru',
    'Rapat akan dilaksanakan pada tanggal 25 Januari 2025'
WHERE NOT EXISTS (SELECT 1 FROM "SuratMasuk" WHERE "noSurat" = '001/DINAS/I/2025');

INSERT INTO "SuratMasuk" (id, "noSurat", "tanggalSurat", "tanggalTerima", pengirim, perihal, lampiran, sifat, status, keterangan)
SELECT 
    gen_random_uuid(),
    '002/SET/II/2025',
    '2025-02-10',
    '2025-02-11',
    'Sekretariat Daerah Kota Bandung',
    'Permohonan Data Pegawai untuk Mutasi',
    '2 berkas',
    'Rahasia',
    'Diproses',
    'Data harus dikirim paling lambat 20 Februari 2025'
WHERE NOT EXISTS (SELECT 1 FROM "SuratMasuk" WHERE "noSurat" = '002/SET/II/2025');

-- =============================================
-- SEED DATA: SAMPLE SURAT KELUAR
-- =============================================
INSERT INTO "SuratKeluar" (id, "noSurat", "tanggalSurat", tujuan, perihal, lampiran, sifat, status, keterangan, "isiSurat")
SELECT 
    gen_random_uuid(),
    '001/OUT/I/2025',
    '2025-01-20',
    'Kantor Walikota Bandung',
    'Laporan Kinerja Triwulan IV Tahun 2024',
    '3 berkas',
    'Biasa',
    'Dikirim',
    'Laporan sudah disetujui oleh kepala dinas',
    '<h2>LAPORAN KINERJA TRIWULAN IV</h2><p>Berdasarkan kegiatan yang telah dilaksanakan pada triwulan IV tahun 2024, berikut kami sampaikan laporan kinerja...</p>'
WHERE NOT EXISTS (SELECT 1 FROM "SuratKeluar" WHERE "noSurat" = '001/OUT/I/2025');

INSERT INTO "SuratKeluar" (id, "noSurat", "tanggalSurat", tujuan, perihal, lampiran, sifat, status, keterangan, "isiSurat")
SELECT 
    gen_random_uuid(),
    '002/OUT/II/2025',
    '2025-02-05',
    'Badan Kepegawaian Daerah',
    'Usulan Kenaikan Pangkat Pegawai',
    '5 berkas',
    'Segera',
    'Draft',
    'Menunggu persetujuan akhir',
    '<h2>USULAN KENAIKAN PANGKAT</h2><p>Dengan hormat, bersama ini kami ajukan usulan kenaikan pangkat untuk pegawai berikut:</p><ul><li>Nama: Ahmad Sudirman</li><li>NIP: 198501152010011001</li></ul>'
WHERE NOT EXISTS (SELECT 1 FROM "SuratKeluar" WHERE "noSurat" = '002/OUT/II/2025');

-- =============================================
-- SEED DATA: SAMPLE DISPOSISI
-- =============================================
INSERT INTO "Disposisi" (id, "suratMasukId", "dariUserId", tujuan, instruksi, status, prioritas, "tenggatWaktu", catatan)
SELECT 
    gen_random_uuid(),
    sm.id,
    u.id,
    'Bagian Umum',
    'Untuk ditindaklanjuti dan dipersiapkan dokumen pendukung',
    'Belum Diproses',
    'Tinggi',
    '2025-01-23',
    'Prioritas tinggi karena batas waktu rapat'
FROM "SuratMasuk" sm, "User" u
WHERE sm."noSurat" = '001/DINAS/I/2025' AND u.email = 'admin@sintas.go.id'
AND NOT EXISTS (SELECT 1 FROM "Disposisi" WHERE "suratMasukId" = sm.id);

INSERT INTO "Disposisi" (id, "suratMasukId", "dariUserId", tujuan, instruksi, status, prioritas, "tenggatWaktu", catatan)
SELECT 
    gen_random_uuid(),
    sm.id,
    u.id,
    'Bagian Kepegawaian',
    'Segera lengkapi data pegawai yang diminta',
    'Sedang Diproses',
    'Urgent',
    '2025-02-18',
    'Data bersifat rahasia, harap hati-hati'
FROM "SuratMasuk" sm, "User" u
WHERE sm."noSurat" = '002/SET/II/2025' AND u.email = 'admin@sintas.go.id'
AND NOT EXISTS (SELECT 1 FROM "Disposisi" WHERE "suratMasukId" = sm.id LIMIT 1);

-- =============================================
-- SEED DATA: SAMPLE ARSIP
-- =============================================
INSERT INTO "Arsip" (id, "noArsip", "tanggalArsip", jenis, keterangan, lokasi, "suratMasukId")
SELECT 
    gen_random_uuid(),
    'AR/2025/001',
    '2025-01-25',
    'Masuk',
    'Arsip surat undangan rapat',
    'Rak A-1',
    sm.id
FROM "SuratMasuk" sm
WHERE sm."noSurat" = '001/DINAS/I/2025'
AND NOT EXISTS (SELECT 1 FROM "Arsip" WHERE "noArsip" = 'AR/2025/001');

INSERT INTO "Arsip" (id, "noArsip", "tanggalArsip", jenis, keterangan, lokasi, "suratKeluarId")
SELECT 
    gen_random_uuid(),
    'AR/2025/002',
    '2025-02-08',
    'Keluar',
    'Arsip laporan kinerja triwulan',
    'Rak B-2',
    sk.id
FROM "SuratKeluar" sk
WHERE sk."noSurat" = '001/OUT/I/2025'
AND NOT EXISTS (SELECT 1 FROM "Arsip" WHERE "noArsip" = 'AR/2025/002');

-- =============================================
-- UPDATE STATUS FOR ARCHIVED LETTERS
-- =============================================
UPDATE "SuratMasuk" SET status = 'Diarsipkan'
WHERE "noSurat" = '001/DINAS/I/2025';

UPDATE "SuratKeluar" SET status = 'Diarsipkan'
WHERE "noSurat" = '001/OUT/I/2025';

-- =============================================
-- DONE! 
-- =============================================
-- Tables created:
-- 1. User (with admin user)
-- 2. KategoriSurat (8 categories)
-- 3. SuratMasuk (2 sample records)
-- 4. SuratKeluar (2 sample records)
-- 5. Disposisi (2 sample records)
-- 6. Arsip (2 sample records)
-- 7. TemplateSurat (3 templates)
-- 8. LogAktivitas
-- =============================================
