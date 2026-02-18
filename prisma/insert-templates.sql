-- SQL Insert Template Surat untuk SINTAS
-- Jalankan di MySQL database Anda

-- Pastikan sudah ada data KategoriSurat terlebih dahulu
-- Jika belum, jalankan ini dulu:
-- INSERT INTO KategoriSurat (id, nama, kode, keterangan, createdAt, updatedAt) VALUES 
-- ('cat001', 'Surat Undangan', 'UND', 'Surat undangan rapat/acara', NOW(), NOW()),
-- ('cat002', 'Surat Pemberitahuan', 'PBG', 'Surat pemberitahuan umum', NOW(), NOW()),
-- ('cat003', 'Surat Keputusan', 'SK', 'Surat keputusan/surat ketetapan', NOW(), NOW()),
-- ('cat004', 'Surat Keterangan', 'KET', 'Surat keterangan umum', NOW(), NOW()),
-- ('cat005', 'Surat Tugas', 'ST', 'Surat tugas/perintah', NOW(), NOW()),
-- ('cat006', 'Surat Edaran', 'SE', 'Surat edaran internal', NOW(), NOW()),
-- ('cat007', 'Surat Permohonan', 'REQ', 'Surat permohonan', NOW(), NOW()),
-- ('cat008', 'Surat Balasan', 'RPL', 'Surat balasan/respon', NOW(), NOW()),
-- ('cat009', 'Surat Pengantar', 'SPT', 'Surat pengantar', NOW(), NOW()),
-- ('cat010', 'Surat Lainnya', 'LAIN', 'Surat lain-lain', NOW(), NOW());

-- =====================================================
-- INSERT TEMPLATE SURAT
-- =====================================================

-- 1. Template Surat Undangan Rapat
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl001', 'Surat Undangan Rapat', 'TUND-001', 
'<p style="text-align: center;"><strong>SURAT UNDANGAN RAPAT</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p>&nbsp;</p>
<p>Kepada Yth.</p>
<p>[Nama Penerima]</p>
<p>[Jabatan/Instansi]</p>
<p>di Tempat</p>
<p>&nbsp;</p>
<p>Dengan hormat,</p>
<p>&nbsp;</p>
<p>Bersama ini kami mengundang Bapak/Ibu untuk menghadiri rapat yang akan dilaksanakan pada:</p>
<p>&nbsp;</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Hari/Tanggal</td><td>: [Hari], [Tanggal]</td></tr>
<tr><td>Waktu</td><td>: [Waktu] WIB</td></tr>
<tr><td>Tempat</td><td>: [Tempat Rapat]</td></tr>
<tr><td>Agenda</td><td>: [Agenda Rapat]</td></tr>
</table>
<p>&nbsp;</p>
<p>Demikian surat undangan ini kami sampaikan. Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>Hormat kami,</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Penandatangan]</p>
<p>[Jabatan]</p>', 
'cat001', 1, NOW(), NOW());

-- 2. Template Surat Pemberitahuan
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl002', 'Surat Pemberitahuan Umum', 'TPBG-001', 
'<p style="text-align: center;"><strong>SURAT PEMBERITAHUAN</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p>&nbsp;</p>
<p>Kepada Yth.</p>
<p>[Nama Penerima]</p>
<p>[Jabatan/Instansi]</p>
<p>di Tempat</p>
<p>&nbsp;</p>
<p>Dengan hormat,</p>
<p>&nbsp;</p>
<p>Melalui surat ini kami memberitahukan bahwa:</p>
<p>&nbsp;</p>
<p style="margin-left: 40px;">[Isi Pemberitahuan]</p>
<p>&nbsp;</p>
<p>Demikian pemberitahuan ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>Hormat kami,</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Penandatangan]</p>
<p>[Jabatan]</p>', 
'cat002', 1, NOW(), NOW());

-- 3. Template Surat Keputusan
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl003', 'Surat Keputusan', 'TSK-001', 
'<p style="text-align: center;"><strong>SURAT KEPUTUSAN</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p style="text-align: center;">Tentang</p>
<p style="text-align: center;"><strong>[PERIHAL KEPUTUSAN]</strong></p>
<p>&nbsp;</p>
<p style="text-align: center;"><strong>KAMI YANG BERTANDA TANGAN DI BAWAH INI:</strong></p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Nama</td><td>: [Nama Pejabat]</td></tr>
<tr><td>Jabatan</td><td>: [Jabatan Pejabat]</td></tr>
<tr><td>NIP</td><td>: [NIP Pejabat]</td></tr>
</table>
<p>&nbsp;</p>
<p><strong>MEMUTUSKAN:</strong></p>
<p>&nbsp;</p>
<p style="margin-left: 40px;"><strong>Pertama:</strong> [Isi Keputusan Pertama]</p>
<p>&nbsp;</p>
<p style="margin-left: 40px;"><strong>Kedua:</strong> [Isi Keputusan Kedua]</p>
<p>&nbsp;</p>
<p style="margin-left: 40px;"><strong>Ketiga:</strong> Surat keputusan ini berlaku sejak tanggal ditetapkan dengan ketentuan apabila dikemudian hari terdapat kekeliruan akan diadakan perbaikan sebagaimana mestinya.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>Ditetapkan di : [Tempat]</p>
<p>Pada tanggal : [Tanggal]</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Pejabat]</p>
<p>[Jabatan]</p>
<p>NIP. [NIP]</p>', 
'cat003', 1, NOW(), NOW());

-- 4. Template Surat Keterangan
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl004', 'Surat Keterangan', 'TKET-001', 
'<p style="text-align: center;"><strong>SURAT KETERANGAN</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p>&nbsp;</p>
<p>Yang bertanda tangan di bawah ini:</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Nama</td><td>: [Nama Penandatangan]</td></tr>
<tr><td>Jabatan</td><td>: [Jabatan]</td></tr>
<tr><td>NIP</td><td>: [NIP]</td></tr>
</table>
<p>&nbsp;</p>
<p>Dengan ini menerangkan bahwa:</p>
<p>&nbsp;</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Nama</td><td>: [Nama yang Diterangkan]</td></tr>
<tr><td>NIP/NIK</td><td>: [NIP/NIK]</td></tr>
<tr><td>Tempat, Tgl Lahir</td><td>: [Tempat], [Tanggal Lahir]</td></tr>
<tr><td>Jabatan</td><td>: [Jabatan]</td></tr>
<tr><td>Alamat</td><td>: [Alamat]</td></tr>
</table>
<p>&nbsp;</p>
<p>Adalah benar [Isi Keterangan - misal: Pegawai di instansi kami / Telah melaksanakan tugas dsb]</p>
<p>&nbsp;</p>
<p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Tempat], [Tanggal]</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Penandatangan]</p>
<p>[Jabatan]</p>
<p>NIP. [NIP]</p>', 
'cat004', 1, NOW(), NOW());

-- 5. Template Surat Tugas
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl005', 'Surat Tugas', 'TST-001', 
'<p style="text-align: center;"><strong>SURAT TUGAS</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p>&nbsp;</p>
<p>Yang bertanda tangan di bawah ini:</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Nama</td><td>: [Nama Pejabat]</td></tr>
<tr><td>Jabatan</td><td>: [Jabatan Pejabat]</td></tr>
<tr><td>NIP</td><td>: [NIP Pejabat]</td></tr>
</table>
<p>&nbsp;</p>
<p><strong>MEMBERI TUGAS KEPADA:</strong></p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Nama</td><td>: [Nama yang Diberi Tugas]</td></tr>
<tr><td>NIP</td><td>: [NIP]</td></tr>
<tr><td>Jabatan</td><td>: [Jabatan]</td></tr>
</table>
<p>&nbsp;</p>
<p><strong>Untuk:</strong></p>
<p>[Uraian Tugas yang Diberikan]</p>
<p>&nbsp;</p>
<p><strong>Dengan ketentuan:</strong></p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Waktu Pelaksanaan</td><td>: [Tanggal/Waktu]</td></tr>
<tr><td>Tempat</td><td>: [Lokasi Pelaksanaan]</td></tr>
<tr><td>Biaya</td><td>: [Biaya/Sumber Dana]</td></tr>
</table>
<p>&nbsp;</p>
<p>Demikian surat tugas ini dibuat untuk dapat dilaksanakan dengan penuh tanggung jawab.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Tempat], [Tanggal]</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Pejabat]</p>
<p>[Jabatan]</p>
<p>NIP. [NIP]</p>', 
'cat005', 1, NOW(), NOW());

-- 6. Template Surat Edaran
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl006', 'Surat Edaran Internal', 'TSE-001', 
'<p style="text-align: center;"><strong>SURAT EDARAN</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p style="text-align: center;">Perihal: [Perihal]</p>
<p>&nbsp;</p>
<p>Kepada Yth.</p>
<p>Seluruh [Penerima Edaran - misal: Kepala Bagian/Staf]</p>
<p>di Tempat</p>
<p>&nbsp;</p>
<p>Dengan hormat,</p>
<p>&nbsp;</p>
<p>Melalui surat edaran ini kami sampaikan hal-hal sebagai berikut:</p>
<p>&nbsp;</p>
<p style="margin-left: 40px;">[Isi Surat Edaran]</p>
<p>&nbsp;</p>
<p>Demikian surat edaran ini kami sampaikan untuk dapat diperhatikan dan dilaksanakan sebagaimana mestinya.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>Hormat kami,</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Penandatangan]</p>
<p>[Jabatan]</p>
<p>NIP. [NIP]</p>', 
'cat006', 1, NOW(), NOW());

-- 7. Template Surat Permohonan
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl007', 'Surat Permohonan', 'TREQ-001', 
'<p style="text-align: center;"><strong>SURAT PERMOHONAN</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p style="text-align: center;">Perihal: Permohonan [Jenis Permohonan]</p>
<p>&nbsp;</p>
<p>Kepada Yth.</p>
<p>[Nama Penerima]</p>
<p>[Jabatan/Instansi Tujuan]</p>
<p>di [Kota]</p>
<p>&nbsp;</p>
<p>Dengan hormat,</p>
<p>&nbsp;</p>
<p>Melalui surat ini kami mengajukan permohonan [Jenis Permohonan] dengan keterangan sebagai berikut:</p>
<p>&nbsp;</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Jenis Permohonan</td><td>: [Jenis]</td></tr>
<tr><td>Keperluan</td><td>: [Keperluan]</td></tr>
<tr><td>Waktu yang Dibutuhkan</td><td>: [Waktu]</td></tr>
</table>
<p>&nbsp;</p>
<p>Adapun alasan permohonan ini adalah:</p>
<p style="margin-left: 40px;">[Uraian Alasan]</p>
<p>&nbsp;</p>
<p>Demikian surat permohonan ini kami ajukan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>Hormat kami,</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Penandatangan]</p>
<p>[Jabatan]</p>
<p>NIP. [NIP]</p>', 
'cat007', 1, NOW(), NOW());

-- 8. Template Surat Balasan
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl008', 'Surat Balasan', 'TRPL-001', 
'<p style="text-align: center;"><strong>SURAT BALASAN</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p style="text-align: center;">Perihal: Balasan [Perihal]</p>
<p style="text-align: center;">Referensi: [Nomor Surat Masuk yang Dibalas]</p>
<p>&nbsp;</p>
<p>Kepada Yth.</p>
<p>[Nama Penerima]</p>
<p>[Jabatan/Instansi]</p>
<p>di [Kota]</p>
<p>&nbsp;</p>
<p>Dengan hormat,</p>
<p>&nbsp;</p>
<p>Menanggapi surat dari [Nama Pengirim Surat Masuk] nomor [Nomor Surat Masuk] tanggal [Tanggal Surat Masuk] perihal [Perihal Surat Masuk], dengan ini kami menyampaikan bahwa:</p>
<p>&nbsp;</p>
<p style="margin-left: 40px;">[Isi Balasan/Tanggapan]</p>
<p>&nbsp;</p>
<p>Demikian surat balasan ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>Hormat kami,</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Penandatangan]</p>
<p>[Jabatan]</p>
<p>NIP. [NIP]</p>', 
'cat008', 1, NOW(), NOW());

-- 9. Template Surat Pengantar
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl009', 'Surat Pengantar', 'TSPT-001', 
'<p style="text-align: center;"><strong>SURAT PENGANTAR</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p>&nbsp;</p>
<p>Kepada Yth.</p>
<p>[Nama Penerima]</p>
<p>[Jabatan/Instansi]</p>
<p>di [Kota]</p>
<p>&nbsp;</p>
<p>Dengan hormat,</p>
<p>&nbsp;</p>
<p>Dengan ini kami mohon pengantar kepada:</p>
<p>&nbsp;</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Nama</td><td>: [Nama yang Dioper]</td></tr>
<tr><td>NIP/NIK</td><td>: [NIP/NIK]</td></tr>
<tr><td>Jabatan</td><td>: [Jabatan]</td></tr>
<tr><td>Keperluan</td><td>: [Keperluan]</td></tr>
</table>
<p>&nbsp;</p>
<p>Untuk menghadap/menemui [Tujuan] dalam rangka [Keperluan].</p>
<p>&nbsp;</p>
<p>Demikian surat pengantar ini kami buat untuk dapat dipergunakan sebagaimana mestinya.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Tempat], [Tanggal]</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Penandatangan]</p>
<p>[Jabatan]</p>
<p>NIP. [NIP]</p>', 
'cat009', 1, NOW(), NOW());

-- 10. Template Surat Undangan Kegiatan/Acara
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl010', 'Surat Undangan Kegiatan/Acara', 'TUND-002', 
'<p style="text-align: center;"><strong>SURAT UNDANGAN</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p>&nbsp;</p>
<p>Kepada Yth.</p>
<p>[Nama Penerima]</p>
<p>[Jabatan/Instansi]</p>
<p>di Tempat</p>
<p>&nbsp;</p>
<p>Dengan hormat,</p>
<p>&nbsp;</p>
<p>Dengan ini kami mengundang Bapak/Ibu untuk hadir dalam acara:</p>
<p>&nbsp;</p>
<p style="text-align: center;"><strong>[NAMA ACARA]</strong></p>
<p>&nbsp;</p>
<p>Yang akan dilaksanakan pada:</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Hari/Tanggal</td><td>: [Hari], [Tanggal]</td></tr>
<tr><td>Waktu</td><td>: [Waktu Mulai] - [Waktu Selesai] WIB</td></tr>
<tr><td>Tempat</td><td>: [Tempat Pelaksanaan]</td></tr>
<tr><td>Alamat</td><td>: [Alamat Lengkap]</td></tr>
</table>
<p>&nbsp;</p>
<p><strong>Acara:</strong></p>
<ol>
<li>[Acara 1]</li>
<li>[Acara 2]</li>
<li>[Acara 3]</li>
</ol>
<p>&nbsp;</p>
<p>Ke hadiran Bapak/Ibu sangat kami harapkan.</p>
<p>&nbsp;</p>
<p>Demikian undangan ini kami sampaikan. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>Hormat kami,</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Penandatangan]</p>
<p>[Jabatan]</p>', 
'cat001', 1, NOW(), NOW());

-- 11. Template Surat Keterangan Kerja
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl011', 'Surat Keterangan Kerja', 'TKET-002', 
'<p style="text-align: center;"><strong>SURAT KETERANGAN KERJA</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p>&nbsp;</p>
<p>Yang bertanda tangan di bawah ini, [Jabatan Penandatangan] [Nama Instansi], dengan ini menerangkan bahwa:</p>
<p>&nbsp;</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Nama</td><td>: [Nama Pegawai]</td></tr>
<tr><td>NIP</td><td>: [NIP]</td></tr>
<tr><td>Tempat/Tgl Lahir</td><td>: [Tempat Lahir], [Tanggal Lahir]</td></tr>
<tr><td>Jenis Kelamin</td><td>: [L/P]</td></tr>
<tr><td>Pendidikan</td><td>: [Pendidikan Terakhir]</td></tr>
<tr><td>Jabatan</td><td>: [Jabatan]</td></tr>
<tr><td>Golongan/Pangkat</td><td>: [Golongan] - [Pangkat]</td></tr>
<tr><td>Unit Kerja</td><td>: [Unit Kerja]</td></tr>
<tr><td>Alamat</td><td>: [Alamat Lengkap]</td></tr>
</table>
<p>&nbsp;</p>
<p>Adalah benar Pegawai Negeri Sipil/Pegawai yang bekerja di [Nama Instansi] sejak tanggal [Tanggal Mulai Kerja].</p>
<p>&nbsp;</p>
<p>Surat keterangan ini dibuat untuk [Keperluan] dan agar dapat dipergunakan sebagaimana mestinya.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Tempat], [Tanggal]</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Penandatangan]</p>
<p>[Jabatan]</p>
<p>NIP. [NIP]</p>', 
'cat004', 1, NOW(), NOW());

-- 12. Template Surat Keterangan Bebas Tugas (Cuti)
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl012', 'Surat Keterangan Cuti', 'TKET-003', 
'<p style="text-align: center;"><strong>SURAT KETERANGAN CUTI</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p>&nbsp;</p>
<p>Yang bertanda tangan di bawah ini:</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Nama</td><td>: [Nama Pejabat]</td></tr>
<tr><td>Jabatan</td><td>: [Jabatan]</td></tr>
<tr><td>NIP</td><td>: [NIP]</td></tr>
</table>
<p>&nbsp;</p>
<p>Dengan ini memberikan cuti kepada:</p>
<p>&nbsp;</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Nama</td><td>: [Nama Pegawai]</td></tr>
<tr><td>NIP</td><td>: [NIP]</td></tr>
<tr><td>Jabatan</td><td>: [Jabatan]</td></tr>
<tr><td>Golongan/Pangkat</td><td>: [Golongan] - [Pangkat]</td></tr>
</table>
<p>&nbsp;</p>
<p><strong>Cuti:</strong></p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Jenis Cuti</td><td>: [Tahunan/Sakit/Besar/dll]</td></tr>
<tr><td>Lama Cuti</td><td>: [Jumlah Hari] hari</td></tr>
<tr><td>Tanggal Mulai</td><td>: [Tanggal Mulai]</td></tr>
<tr><td>Tanggal Selesai</td><td>: [Tanggal Selesai]</td></tr>
<tr><td>Alasan</td><td>: [Alasan Cuti]</td></tr>
</table>
<p>&nbsp;</p>
<p>Demikian surat keterangan cuti ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Tempat], [Tanggal]</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Pejabat]</p>
<p>[Jabatan]</p>
<p>NIP. [NIP]</p>', 
'cat004', 1, NOW(), NOW());

-- 13. Template Surat Pemberitahuan Libur
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl013', 'Surat Pemberitahuan Hari Libur', 'TPBG-002', 
'<p style="text-align: center;"><strong>SURAT PEMBERITAHUAN</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p style="text-align: center;">Perihal: Hari Libur [Nama Hari Libur]</p>
<p>&nbsp;</p>
<p>Kepada Yth.</p>
<p>Seluruh Karyawan/Pegawai</p>
<p>[Nama Instansi]</p>
<p>di Tempat</p>
<p>&nbsp;</p>
<p>Dengan hormat,</p>
<p>&nbsp;</p>
<p>Dengan ini kami informasikan bahwa dalam rangka memperingati Hari [Nama Hari Libur], maka ditetapkan hari libur sebagai berikut:</p>
<p>&nbsp;</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Hari/Tanggal</td><td>: [Hari], [Tanggal]</td></tr>
<tr><td>Keterangan</td><td>: Hari Libur [Nama Hari Libur]</td></tr>
</table>
<p>&nbsp;</p>
<p>Kegiatan kantor/instansi akan kembali normal pada tanggal [Tanggal Masuk Kembali].</p>
<p>&nbsp;</p>
<p>Demikian pemberitahuan ini kami sampaikan. Atas perhatiannya, kami ucapkan terima kasih.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>Hormat kami,</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Penandatangan]</p>
<p>[Jabatan]</p>
<p>NIP. [NIP]</p>', 
'cat002', 1, NOW(), NOW());

-- 14. Template Surat Perintah Perjalanan Dinas
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl014', 'Surat Perintah Perjalanan Dinas', 'TST-002', 
'<p style="text-align: center;"><strong>SURAT PERINTAH PERJALANAN DINAS</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p>&nbsp;</p>
<p>Yang bertanda tangan di bawah ini:</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Nama</td><td>: [Nama Pejabat Pemberi Perintah]</td></tr>
<tr><td>Jabatan</td><td>: [Jabatan]</td></tr>
<tr><td>NIP</td><td>: [NIP]</td></tr>
</table>
<p>&nbsp;</p>
<p><strong>MEMERINTAHKAN</strong> kepada:</p>
<p>&nbsp;</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Nama</td><td>: [Nama Pegawai]</td></tr>
<tr><td>NIP</td><td>: [NIP]</td></tr>
<tr><td>Jabatan</td><td>: [Jabatan]</td></tr>
<tr><td>Golongan</td><td>: [Golongan]</td></tr>
</table>
<p>&nbsp;</p>
<p><strong>Untuk melaksanakan perjalanan dinas dengan ketentuan sebagai berikut:</strong></p>
<p>&nbsp;</p>
<table style="border-collapse: collapse; width: 100%;">
<tr><td style="width: 30%;">Maksud Perjalanan</td><td>: [Maksud/Tujuan Perjalanan]</td></tr>
<tr><td>Tempat Tujuan</td><td>: [Kota/Tempat Tujuan]</td></tr>
<tr><td>Tanggal Berangkat</td><td>: [Tanggal Berangkat]</td></tr>
<tr><td>Tanggal Kembali</td><td>: [Tanggal Kembali]</td></tr>
<tr><td>Lama Perjalanan</td><td>: [Jumlah Hari] hari</td></tr>
<tr><td>Alat Angkut</td><td>: [Kendaraan yang Digunakan]</td></tr>
<tr><td>Sumber Biaya</td><td>: [APBN/APBD/Non-APBN]</td></tr>
</table>
<p>&nbsp;</p>
<p>Demikian surat perintah perjalanan dinas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Tempat], [Tanggal]</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Pejabat]</p>
<p>[Jabatan]</p>
<p>NIP. [NIP]</p>', 
'cat005', 1, NOW(), NOW());

-- 15. Template Surat Laporan
INSERT INTO TemplateSurat (id, nama, kode, konten, kategoriId, isActive, createdAt, updatedAt) VALUES 
('tpl015', 'Surat Laporan', 'TLAP-001', 
'<p style="text-align: center;"><strong>SURAT LAPORAN</strong></p>
<p style="text-align: center;">Nomor: [Nomor Surat]</p>
<p style="text-align: center;">Perihal: Laporan [Jenis Laporan]</p>
<p>&nbsp;</p>
<p>Kepada Yth.</p>
<p>[Nama Penerima Laporan]</p>
<p>[Jabatan]</p>
<p>di [Kota]</p>
<p>&nbsp;</p>
<p>Dengan hormat,</p>
<p>&nbsp;</p>
<p>Bersama ini kami sampaikan laporan [Jenis Laporan] sebagai berikut:</p>
<p>&nbsp;</p>
<p style="margin-left: 40px;"><strong>I. PENDAHULUAN</strong></p>
<p style="margin-left: 40px;">[Uraian Pendahuluan]</p>
<p>&nbsp;</p>
<p style="margin-left: 40px;"><strong>II. ISI LAPORAN</strong></p>
<p style="margin-left: 40px;">[Uraian Isi Laporan]</p>
<p>&nbsp;</p>
<p style="margin-left: 40px;"><strong>III. KESIMPULAN</strong></p>
<p style="margin-left: 40px;">[Uraian Kesimpulan]</p>
<p>&nbsp;</p>
<p style="margin-left: 40px;"><strong>IV. SARAN</strong></p>
<p style="margin-left: 40px;">[Uraian Saran]</p>
<p>&nbsp;</p>
<p>Demikian laporan ini kami sampaikan. Atas perhatian Bapak/Ibu, kami ucapkan terima kasih.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>Hormat kami,</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>[Nama Penandatangan]</p>
<p>[Jabatan]</p>
<p>NIP. [NIP]</p>', 
'cat010', 1, NOW(), NOW());

-- =====================================================
-- TAMBAHAN: Insert User Default
-- =====================================================

-- Insert User Admin default (password: admin123 - sudah di-hash dengan bcrypt)
-- Catatan: Hash di bawah adalah contoh, sebaiknya generate ulang dengan bcrypt
INSERT INTO User (id, email, password, name, role, jabatan, nip, isActive, createdAt, updatedAt) VALUES 
('usr001', 'admin@sintas.local', '$2b$10$YourBcryptHashHere', 'Administrator', 'admin', 'Administrator Sistem', 'ADMIN001', 1, NOW(), NOW()),
('usr002', 'kepala@sintas.local', '$2b$10$YourBcryptHashHere', 'Kepala Bagian', 'kepala', 'Kepala Bagian Administrasi', 'KEP001', 1, NOW(), NOW()),
('usr003', 'staff@sintas.local', '$2b$10$YourBcryptHashHere', 'Staff Administrasi', 'staff', 'Staff Administrasi', 'STF001', 1, NOW(), NOW());

-- =====================================================
-- VERIFIKASI DATA
-- =====================================================

-- Setelah insert, jalankan query ini untuk verifikasi:
-- SELECT * FROM KategoriSurat;
-- SELECT id, nama, kode FROM TemplateSurat;
-- SELECT id, email, name, role FROM User;
