-- =====================================================
-- SINTAS Database Schema for Supabase PostgreSQL
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT DEFAULT 'staff',
  "jabatan" TEXT,
  "nip" TEXT,
  "phone" TEXT,
  "avatar" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. KATEGORI SURAT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "KategoriSurat" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "nama" TEXT NOT NULL,
  "kode" TEXT UNIQUE NOT NULL,
  "keterangan" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. SURAT MASUK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "SuratMasuk" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "noSurat" TEXT NOT NULL,
  "tanggalSurat" TIMESTAMP(3) NOT NULL,
  "tanggalTerima" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "pengirim" TEXT NOT NULL,
  "perihal" TEXT NOT NULL,
  "lampiran" TEXT,
  "sifat" TEXT DEFAULT 'Biasa',
  "status" TEXT DEFAULT 'Baru',
  "keterangan" TEXT,
  "fileUrl" TEXT,
  "fileName" TEXT,
  "fileSize" INTEGER,
  "fileType" TEXT,
  "kategoriId" TEXT REFERENCES "KategoriSurat"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. SURAT KELUAR TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "SuratKeluar" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "noSurat" TEXT NOT NULL,
  "tanggalSurat" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "tujuan" TEXT NOT NULL,
  "perihal" TEXT NOT NULL,
  "lampiran" TEXT,
  "sifat" TEXT DEFAULT 'Biasa',
  "status" TEXT DEFAULT 'Draft',
  "keterangan" TEXT,
  "fileUrl" TEXT,
  "isiSurat" TEXT,
  "tempatTtd" TEXT,
  "jabatanTtd" TEXT,
  "namaTtd" TEXT,
  "nipTtd" TEXT,
  "tembusan" TEXT,
  "kategoriId" TEXT REFERENCES "KategoriSurat"("id") ON DELETE SET NULL,
  "createdBy" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. DISPOSISI TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "Disposisi" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "suratMasukId" TEXT NOT NULL REFERENCES "SuratMasuk"("id") ON DELETE CASCADE,
  "dariUserId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "keUserId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "tujuan" TEXT NOT NULL,
  "instruksi" TEXT NOT NULL,
  "status" TEXT DEFAULT 'Belum Diproses',
  "tenggatWaktu" TIMESTAMP(3),
  "catatan" TEXT,
  "prioritas" TEXT DEFAULT 'Normal',
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. ARSIP TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "Arsip" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "noArsip" TEXT UNIQUE NOT NULL,
  "tanggalArsip" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "keterangan" TEXT,
  "lokasi" TEXT,
  "jenis" TEXT NOT NULL,
  "fileUrl" TEXT,
  "fileName" TEXT,
  "fileSize" INTEGER,
  "fileType" TEXT,
  "suratMasukId" TEXT UNIQUE REFERENCES "SuratMasuk"("id") ON DELETE SET NULL,
  "suratKeluarId" TEXT UNIQUE REFERENCES "SuratKeluar"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. TEMPLATE SURAT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "TemplateSurat" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "nama" TEXT NOT NULL,
  "kode" TEXT UNIQUE NOT NULL,
  "konten" TEXT NOT NULL,
  "kategoriId" TEXT REFERENCES "KategoriSurat"("id") ON DELETE SET NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. LOG AKTIVITAS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS "LogAktivitas" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT,
  "aksi" TEXT NOT NULL,
  "entitas" TEXT NOT NULL,
  "entitasId" TEXT,
  "detail" TEXT,
  "ip" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "SuratMasuk_kategoriId_idx" ON "SuratMasuk"("kategoriId");
CREATE INDEX IF NOT EXISTS "SuratMasuk_status_idx" ON "SuratMasuk"("status");
CREATE INDEX IF NOT EXISTS "SuratMasuk_tanggalSurat_idx" ON "SuratMasuk"("tanggalSurat");
CREATE INDEX IF NOT EXISTS "SuratKeluar_kategoriId_idx" ON "SuratKeluar"("kategoriId");
CREATE INDEX IF NOT EXISTS "SuratKeluar_status_idx" ON "SuratKeluar"("status");
CREATE INDEX IF NOT EXISTS "SuratKeluar_createdBy_idx" ON "SuratKeluar"("createdBy");
CREATE INDEX IF NOT EXISTS "Disposisi_suratMasukId_idx" ON "Disposisi"("suratMasukId");
CREATE INDEX IF NOT EXISTS "Disposisi_dariUserId_idx" ON "Disposisi"("dariUserId");
CREATE INDEX IF NOT EXISTS "Disposisi_status_idx" ON "Disposisi"("status");
CREATE INDEX IF NOT EXISTS "Arsip_jenis_idx" ON "Arsip"("jenis");
CREATE INDEX IF NOT EXISTS "TemplateSurat_kategoriId_idx" ON "TemplateSurat"("kategoriId");

-- =====================================================
-- SEED DATA: ADMIN USER
-- Password: admin123 (bcrypt hashed)
-- =====================================================
INSERT INTO "User" ("id", "email", "password", "name", "role", "jabatan", "nip", "isActive")
VALUES (
  'admin-001',
  'admin@sintas.com',
  '$2a$10$rQZ3ZX1v8vRJYKVQwZzYXOqWqZHzJQF5HXJ3mNVJc9gFyvZGFzPzK',
  'Administrator',
  'admin',
  'Administrator Sistem',
  'NIP001',
  true
) ON CONFLICT ("email") DO NOTHING;

-- =====================================================
-- SEED DATA: KATEGORI SURAT
-- =====================================================
INSERT INTO "KategoriSurat" ("id", "nama", "kode", "keterangan") VALUES
  ('kat-001', 'Surat Keputusan', 'SK', 'Surat keputusan resmi instansi'),
  ('kat-002', 'Surat Undangan', 'UND', 'Surat undangan rapat/acara'),
  ('kat-003', 'Surat Keterangan', 'KET', 'Surat keterangan umum'),
  ('kat-004', 'Surat Pemberitahuan', 'PT', 'Surat pemberitahuan resmi'),
  ('kat-005', 'Surat Perintah', 'SP', 'Surat perintah tugas')
ON CONFLICT ("kode") DO NOTHING;

-- =====================================================
-- SEED DATA: TEMPLATE SURAT
-- =====================================================
INSERT INTO "TemplateSurat" ("id", "nama", "kode", "konten", "kategoriId", "isActive") VALUES
  ('tpl-001', 'Template Surat Undangan Rapat', 'TPL-UND-01', 
   '<h1 style="text-align: center;">UNDANGAN RAPAT</h1><p>Kepada Yth.<br/>{{tujuan}}<br/>di Tempat</p><p>Dengan hormat,<br/>Dengan ini kami mengundang Bapak/Ibu untuk menghadiri rapat yang akan dilaksanakan pada:</p><p>Hari/Tanggal: {{tanggal}}<br/>Waktu: {{waktu}}<br/>Tempat: {{tempat}}<br/>Agenda: {{agenda}}</p><p>Demikian undangan ini disampaikan. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.</p>',
   'kat-002', true),
  ('tpl-002', 'Template Surat Keterangan', 'TPL-KET-01',
   '<h1 style="text-align: center;">SURAT KETERANGAN</h1><p style="text-align: center;">Nomor: {{nomor}}</p><p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p><p>Nama: {{nama}}<br/>NIP: {{nip}}<br/>Jabatan: {{jabatan}}</p><p>Adalah benar {{keterangan}}</p><p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>',
   'kat-003', true)
ON CONFLICT ("kode") DO NOTHING;

-- =====================================================
-- SEED DATA: SAMPLE SURAT MASUK
-- =====================================================
INSERT INTO "SuratMasuk" ("id", "noSurat", "tanggalSurat", "pengirim", "perihal", "sifat", "status", "kategoriId") VALUES
  ('sm-001', 'SM/001/I/2025', '2025-01-15', 'Kementerian Dalam Negeri', 'Undangan Rapat Koordinasi', 'Segera', 'Baru', 'kat-002'),
  ('sm-002', 'SM/002/I/2025', '2025-01-18', 'BPKP', 'Permintaan Data Keuangan', 'Biasa', 'Diproses', 'kat-004')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: SAMPLE SURAT KELUAR
-- =====================================================
INSERT INTO "SuratKeluar" ("id", "noSurat", "tanggalSurat", "tujuan", "perihal", "sifat", "status", "kategoriId", "createdBy") VALUES
  ('sk-001', 'SK/001/I/2025', '2025-01-16', 'Kementerian Dalam Negeri', 'Laporan Kegiatan Triwulan IV', 'Biasa', 'Dikirim', 'kat-004', 'admin-001'),
  ('sk-002', 'SK/002/I/2025', '2025-01-19', 'Inspektorat Daerah', 'Permohonan Pengadaan Barang', 'Segera', 'Draft', 'kat-005', 'admin-001')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: SAMPLE DISPOSISI
-- =====================================================
INSERT INTO "Disposisi" ("id", "suratMasukId", "dariUserId", "tujuan", "instruksi", "status", "prioritas") VALUES
  ('disp-001', 'sm-001', 'admin-001', 'Bagian Umum', 'Harap ditindaklanjuti dan disiapkan untuk rapat', 'Belum Diproses', 'Tinggi')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: SAMPLE ARSIP
-- =====================================================
INSERT INTO "Arsip" ("id", "noArsip", "jenis", "keterangan", "lokasi", "suratMasukId") VALUES
  ('ars-001', 'AR/2025/001', 'Masuk', 'Arsip surat masuk tahun 2025', 'Rak A-1', 'sm-001')
ON CONFLICT ("noArsip") DO NOTHING;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Database SINTAS berhasil dibuat!' AS message;
