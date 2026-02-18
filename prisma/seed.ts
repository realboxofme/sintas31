import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed kategori surat
  const kategoriData = [
    { nama: "Surat Keputusan", kode: "SK", keterangan: "Surat keputusan resmi" },
    { nama: "Surat Undangan", kode: "UND", keterangan: "Surat undangan rapat/acara" },
    { nama: "Surat Pemberitahuan", kode: "PB", keterangan: "Surat pemberitahuan umum" },
    { nama: "Surat Permohonan", kode: "PM", keterangan: "Surat permohonan" },
    { nama: "Surat Keterangan", kode: "KET", keterangan: "Surat keterangan resmi" },
    { nama: "Surat Tugas", kode: "ST", keterangan: "Surat tugas karyawan" },
    { nama: "Surat Edaran", kode: "SE", keterangan: "Surat edaran internal" },
    { nama: "Surat Dinas", kode: "SD", keterangan: "Surat dinas umum" },
  ];

  for (const kategori of kategoriData) {
    await prisma.kategoriSurat.upsert({
      where: { kode: kategori.kode },
      update: {},
      create: kategori,
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
