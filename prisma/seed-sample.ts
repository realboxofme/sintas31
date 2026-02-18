import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample data...');

  // Get existing kategori and users
  const kategori = await prisma.kategoriSurat.findMany();
  const users = await prisma.user.findMany();

  if (kategori.length === 0) {
    // Create kategori if not exists
    await prisma.kategoriSurat.createMany({
      data: [
        { nama: 'Umum', kode: 'UMM', keterangan: 'Surat Umum' },
        { nama: 'Kepegawaian', kode: 'KEP', keterangan: 'Surat Kepegawaian' },
        { nama: 'Keuangan', kode: 'KEU', keterangan: 'Surat Keuangan' },
        { nama: 'Undangan', kode: 'UND', keterangan: 'Surat Undangan' },
      ],
      skipDuplicates: true,
    });
  }

  const allKategori = await prisma.kategoriSurat.findMany();
  const adminUser = users.find(u => u.email === 'admin@sintas.go.id');

  // Insert Surat Masuk
  const existingMasuk = await prisma.suratMasuk.count();
  if (existingMasuk === 0) {
    console.log('Inserting Surat Masuk...');
    await prisma.suratMasuk.createMany({
      data: [
        {
          noSurat: '001/DINAS/I/2025',
          tanggalSurat: new Date('2025-01-15'),
          tanggalTerima: new Date('2025-01-16'),
          pengirim: 'Dinas Pendidikan Kota Bandung',
          perihal: 'Undangan Rapat Koordinasi Program Sekolah',
          lampiran: '1 berkas',
          sifat: 'Segera',
          status: 'Baru',
          keterangan: 'Rapat akan dilaksanakan pada tanggal 25 Januari 2025',
          kategoriId: allKategori.find(k => k.kode === 'UND')?.id || allKategori[0]?.id,
        },
        {
          noSurat: '002/SET/II/2025',
          tanggalSurat: new Date('2025-02-10'),
          tanggalTerima: new Date('2025-02-11'),
          pengirim: 'Sekretariat Daerah Kota Bandung',
          perihal: 'Permohonan Data Pegawai untuk Mutasi',
          lampiran: '2 berkas',
          sifat: 'Rahasia',
          status: 'Diproses',
          keterangan: 'Data harus dikirim paling lambat 20 Februari 2025',
          kategoriId: allKategori.find(k => k.kode === 'KEP')?.id || allKategori[0]?.id,
        },
      ],
    });
  }

  // Insert Surat Keluar
  const existingKeluar = await prisma.suratKeluar.count();
  if (existingKeluar === 0) {
    console.log('Inserting Surat Keluar...');
    await prisma.suratKeluar.createMany({
      data: [
        {
          noSurat: '001/OUT/I/2025',
          tanggalSurat: new Date('2025-01-20'),
          tujuan: 'Kantor Walikota Bandung',
          perihal: 'Laporan Kinerja Triwulan IV Tahun 2024',
          lampiran: '3 berkas',
          sifat: 'Biasa',
          status: 'Dikirim',
          keterangan: 'Laporan sudah disetujui oleh kepala dinas',
          kategoriId: allKategori.find(k => k.kode === 'UMM')?.id || allKategori[0]?.id,
          isiSurat: '<h2>LAPORAN KINERJA TRIWULAN IV</h2><p>Berdasarkan kegiatan yang telah dilaksanakan pada triwulan IV tahun 2024, berikut kami sampaikan laporan kinerja...</p>',
          createdBy: adminUser?.id,
        },
        {
          noSurat: '002/OUT/II/2025',
          tanggalSurat: new Date('2025-02-05'),
          tujuan: 'Badan Kepegawaian Daerah',
          perihal: 'Usulan Kenaikan Pangkat Pegawai',
          lampiran: '5 berkas',
          sifat: 'Segera',
          status: 'Draft',
          keterangan: 'Menunggu persetujuan akhir',
          kategoriId: allKategori.find(k => k.kode === 'KEP')?.id || allKategori[0]?.id,
          isiSurat: '<h2>USULAN KENAIKAN PANGKAT</h2><p>Dengan hormat, bersama ini kami ajukan usulan kenaikan pangkat untuk pegawai berikut:</p><ul><li>Nama: Ahmad Sudirman</li><li>NIP: 198501152010011001</li></ul>',
          createdBy: adminUser?.id,
        },
      ],
    });
  }

  // Get inserted surat for disposisi and arsip
  const suratMasuk = await prisma.suratMasuk.findMany();
  const suratKeluar = await prisma.suratKeluar.findMany();

  // Insert Disposisi
  const existingDisposisi = await prisma.disposisi.count();
  if (existingDisposisi === 0 && suratMasuk.length > 0 && adminUser) {
    console.log('Inserting Disposisi...');
    await prisma.disposisi.createMany({
      data: [
        {
          suratMasukId: suratMasuk[0].id,
          dariUserId: adminUser.id,
          tujuan: 'Bagian Umum',
          instruksi: 'Untuk ditindaklanjuti dan dipersiapkan dokumen pendukung',
          status: 'Belum Diproses',
          prioritas: 'Tinggi',
          tenggatWaktu: new Date('2025-01-23'),
          catatan: 'Prioritas tinggi karena batas waktu rapat',
        },
        {
          suratMasukId: suratMasuk[1].id,
          dariUserId: adminUser.id,
          tujuan: 'Bagian Kepegawaian',
          instruksi: 'Segera lengkapi data pegawai yang diminta',
          status: 'Sedang Diproses',
          prioritas: 'Urgent',
          tenggatWaktu: new Date('2025-02-18'),
          catatan: 'Data bersifat rahasia, harap hati-hati',
        },
      ],
    });
  }

  // Insert Arsip
  const existingArsip = await prisma.arsip.count();
  if (existingArsip === 0) {
    console.log('Inserting Arsip...');
    const currentYear = new Date().getFullYear();
    await prisma.arsip.createMany({
      data: [
        {
          noArsip: `AR/${currentYear}/001`,
          tanggalArsip: new Date('2025-01-25'),
          jenis: 'Masuk',
          keterangan: 'Arsip surat undangan rapat',
          lokasi: 'Rak A-1',
          suratMasukId: suratMasuk[0]?.id,
        },
        {
          noArsip: `AR/${currentYear}/002`,
          tanggalArsip: new Date('2025-02-08'),
          jenis: 'Keluar',
          keterangan: 'Arsip laporan kinerja triwulan',
          lokasi: 'Rak B-2',
          suratKeluarId: suratKeluar[0]?.id,
        },
      ],
    });
  }

  // Update status surat yang sudah diarsipkan
  if (suratMasuk[0]) {
    await prisma.suratMasuk.update({
      where: { id: suratMasuk[0].id },
      data: { status: 'Diarsipkan' },
    });
  }
  if (suratKeluar[0]) {
    await prisma.suratKeluar.update({
      where: { id: suratKeluar[0].id },
      data: { status: 'Diarsipkan' },
    });
  }

  console.log('Sample data seeding completed!');
  console.log('Summary:');
  console.log(`- Surat Masuk: ${await prisma.suratMasuk.count()} records`);
  console.log(`- Surat Keluar: ${await prisma.suratKeluar.count()} records`);
  console.log(`- Disposisi: ${await prisma.disposisi.count()} records`);
  console.log(`- Arsip: ${await prisma.arsip.count()} records`);
  console.log(`- Kategori: ${await prisma.kategoriSurat.count()} records`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
