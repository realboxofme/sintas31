import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const BULAN_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tahun = searchParams.get('tahun') ? parseInt(searchParams.get('tahun')!) : new Date().getFullYear();
    const bulan = searchParams.get('bulan') ? parseInt(searchParams.get('bulan')!) : null;

    // If specific month is requested
    if (bulan !== null) {
      return getMonthlyDetail(tahun, bulan);
    }

    // Otherwise, return full year summary
    return getYearlySummary(tahun);
  } catch (error) {
    console.error('Error fetching bulanan report:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil laporan bulanan' },
      { status: 500 }
    );
  }
}

async function getYearlySummary(tahun: number) {
  const startDate = new Date(`${tahun}-01-01`);
  const endDate = new Date(`${tahun}-12-31`);

  // Get all surat masuk for the year
  const suratMasuk = await db.suratMasuk.findMany({
    where: {
      tanggalTerima: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      id: true,
      noSurat: true,
      tanggalTerima: true,
      tanggalSurat: true,
      pengirim: true,
      perihal: true,
      sifat: true,
      status: true,
      kategoriId: true
    }
  });

  // Get all surat keluar for the year
  const suratKeluar = await db.suratKeluar.findMany({
    where: {
      tanggalSurat: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      id: true,
      noSurat: true,
      tanggalSurat: true,
      tujuan: true,
      perihal: true,
      sifat: true,
      status: true,
      kategoriId: true
    }
  });

  // Get all disposisi for the year
  const disposisi = await db.disposisi.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      id: true,
      createdAt: true,
      status: true,
      prioritas: true
    }
  });

  // Get all arsip for the year
  const arsip = await db.arsip.findMany({
    where: {
      tanggalArsip: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      id: true,
      tanggalArsip: true,
      jenis: true
    }
  });

  // Get kategoris
  const kategoris = await db.kategoriSurat.findMany();
  const kategoriMap = new Map(kategoris.map(k => [k.id, k.nama]));

  // Process monthly data
  const monthlyData = BULAN_INDONESIA.map((namaBulan, index) => {
    const masukBulanIni = suratMasuk.filter(s => new Date(s.tanggalTerima).getMonth() === index);
    const keluarBulanIni = suratKeluar.filter(s => new Date(s.tanggalSurat).getMonth() === index);
    const disposisiBulanIni = disposisi.filter(d => new Date(d.createdAt).getMonth() === index);
    const arsipBulanIni = arsip.filter(a => new Date(a.tanggalArsip).getMonth() === index);

    // Per status surat masuk
    const masukPerStatus = {
      Baru: masukBulanIni.filter(s => s.status === 'Baru').length,
      Diproses: masukBulanIni.filter(s => s.status === 'Diproses').length,
      Selesai: masukBulanIni.filter(s => s.status === 'Selesai').length,
      Diarsipkan: masukBulanIni.filter(s => s.status === 'Diarsipkan').length
    };

    // Per status surat keluar
    const keluarPerStatus = {
      Draft: keluarBulanIni.filter(s => s.status === 'Draft').length,
      Dikirim: keluarBulanIni.filter(s => s.status === 'Dikirim').length,
      Diarsipkan: keluarBulanIni.filter(s => s.status === 'Diarsipkan').length
    };

    // Per sifat
    const masukPerSifat = {
      Biasa: masukBulanIni.filter(s => s.sifat === 'Biasa').length,
      Segera: masukBulanIni.filter(s => s.sifat === 'Segera').length,
      'Sangat Segera': masukBulanIni.filter(s => s.sifat === 'Sangat Segera').length,
      Rahasia: masukBulanIni.filter(s => s.sifat === 'Rahasia').length
    };

    const keluarPerSifat = {
      Biasa: keluarBulanIni.filter(s => s.sifat === 'Biasa').length,
      Segera: keluarBulanIni.filter(s => s.sifat === 'Segera').length,
      'Sangat Segera': keluarBulanIni.filter(s => s.sifat === 'Sangat Segera').length,
      Rahasia: keluarBulanIni.filter(s => s.sifat === 'Rahasia').length
    };

    // Disposisi per status
    const disposisiPerStatus = {
      'Belum Diproses': disposisiBulanIni.filter(d => d.status === 'Belum Diproses').length,
      'Sedang Diproses': disposisiBulanIni.filter(d => d.status === 'Sedang Diproses').length,
      Selesai: disposisiBulanIni.filter(d => d.status === 'Selesai').length
    };

    // Arsip per jenis
    const arsipPerJenis = {
      Masuk: arsipBulanIni.filter(a => a.jenis === 'Masuk').length,
      Keluar: arsipBulanIni.filter(a => a.jenis === 'Keluar').length
    };

    return {
      bulan: index + 1,
      namaBulan,
      suratMasuk: {
        total: masukBulanIni.length,
        perStatus: masukPerStatus,
        perSifat: masukPerSifat
      },
      suratKeluar: {
        total: keluarBulanIni.length,
        perStatus: keluarPerStatus,
        perSifat: keluarPerSifat
      },
      disposisi: {
        total: disposisiBulanIni.length,
        perStatus: disposisiPerStatus
      },
      arsip: {
        total: arsipBulanIni.length,
        perJenis: arsipPerJenis
      }
    };
  });

  // Yearly totals
  const yearlyTotals = {
    suratMasuk: suratMasuk.length,
    suratKeluar: suratKeluar.length,
    disposisi: disposisi.length,
    arsip: arsip.length
  };

  // Top pengirim
  const pengirimCount = new Map<string, number>();
  suratMasuk.forEach(s => {
    pengirimCount.set(s.pengirim, (pengirimCount.get(s.pengirim) || 0) + 1);
  });
  const topPengirim = Array.from(pengirimCount.entries())
    .map(([pengirim, jumlah]) => ({ pengirim, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 10);

  // Top tujuan
  const tujuanCount = new Map<string, number>();
  suratKeluar.forEach(s => {
    tujuanCount.set(s.tujuan, (tujuanCount.get(s.tujuan) || 0) + 1);
  });
  const topTujuan = Array.from(tujuanCount.entries())
    .map(([tujuan, jumlah]) => ({ tujuan, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 10);

  // Per kategori
  const kategoriCount = new Map<string, number>();
  suratMasuk.forEach(s => {
    const nama = s.kategoriId ? kategoriMap.get(s.kategoriId) || 'Tidak Berkategori' : 'Tidak Berkategori';
    kategoriCount.set(nama, (kategoriCount.get(nama) || 0) + 1);
  });
  suratKeluar.forEach(s => {
    const nama = s.kategoriId ? kategoriMap.get(s.kategoriId) || 'Tidak Berkategori' : 'Tidak Berkategori';
    kategoriCount.set(nama, (kategoriCount.get(nama) || 0) + 1);
  });
  const perKategori = Array.from(kategoriCount.entries())
    .map(([kategori, jumlah]) => ({ kategori, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah);

  return NextResponse.json({
    success: true,
    data: {
      tahun,
      yearlyTotals,
      monthlyData,
      topPengirim,
      topTujuan,
      perKategori
    }
  });
}

async function getMonthlyDetail(tahun: number, bulan: number) {
  const startDate = new Date(tahun, bulan - 1, 1);
  const endDate = new Date(tahun, bulan, 0); // Last day of month

  // Get surat masuk detail
  const suratMasuk = await db.suratMasuk.findMany({
    where: {
      tanggalTerima: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      kategori: {
        select: { nama: true, kode: true }
      },
      disposisi: {
        select: {
          id: true,
          tujuan: true,
          status: true,
          instruksi: true
        }
      }
    },
    orderBy: {
      tanggalTerima: 'asc'
    }
  });

  // Get surat keluar detail
  const suratKeluar = await db.suratKeluar.findMany({
    where: {
      tanggalSurat: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      kategori: {
        select: { nama: true, kode: true }
      },
      author: {
        select: { name: true, jabatan: true }
      }
    },
    orderBy: {
      tanggalSurat: 'asc'
    }
  });

  // Get disposisi detail
  const disposisi = await db.disposisi.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      suratMasuk: {
        select: {
          noSurat: true,
          perihal: true
        }
      },
      dariUser: {
        select: { name: true, jabatan: true }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Get arsip detail
  const arsip = await db.arsip.findMany({
    where: {
      tanggalArsip: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      suratMasuk: {
        select: { noSurat: true, perihal: true }
      },
      suratKeluar: {
        select: { noSurat: true, perihal: true }
      }
    },
    orderBy: {
      tanggalArsip: 'asc'
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      tahun,
      bulan,
      namaBulan: BULAN_INDONESIA[bulan - 1],
      periode: {
        mulai: startDate,
        selesai: endDate
      },
      ringkasan: {
        totalMasuk: suratMasuk.length,
        totalKeluar: suratKeluar.length,
        totalDisposisi: disposisi.length,
        totalArsip: arsip.length
      },
      detail: {
        suratMasuk,
        suratKeluar,
        disposisi,
        arsip
      }
    }
  });
}
