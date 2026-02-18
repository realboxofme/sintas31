import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const BULAN_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const tahun = searchParams.get('tahun') ? parseInt(searchParams.get('tahun')!) : new Date().getFullYear();

    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get total surat masuk
    const totalMasuk = await db.suratMasuk.count({
      where: startDate || endDate ? {
        tanggalTerima: dateFilter
      } : undefined
    });

    // Get total surat keluar
    const totalKeluar = await db.suratKeluar.count({
      where: startDate || endDate ? {
        tanggalSurat: dateFilter
      } : undefined
    });

    // Get surat per bulan untuk tahun yang dipilih
    const suratMasukData = await db.suratMasuk.findMany({
      where: {
        tanggalTerima: {
          gte: new Date(`${tahun}-01-01`),
          lte: new Date(`${tahun}-12-31`)
        }
      },
      select: {
        tanggalTerima: true
      }
    });

    const suratKeluarData = await db.suratKeluar.findMany({
      where: {
        tanggalSurat: {
          gte: new Date(`${tahun}-01-01`),
          lte: new Date(`${tahun}-12-31`)
        }
      },
      select: {
        tanggalSurat: true
      }
    });

    // Aggregate per bulan
    const perBulan = BULAN_INDONESIA.map((bulan, index) => {
      const masuk = suratMasukData.filter(
        item => new Date(item.tanggalTerima).getMonth() === index
      ).length;

      const keluar = suratKeluarData.filter(
        item => new Date(item.tanggalSurat).getMonth() === index
      ).length;

      return { bulan, masuk, keluar };
    });

    // Get surat per kategori
    const suratMasukPerKategori = await db.suratMasuk.groupBy({
      by: ['kategoriId'],
      _count: true,
      where: startDate || endDate ? {
        tanggalTerima: dateFilter
      } : undefined
    });

    const suratKeluarPerKategori = await db.suratKeluar.groupBy({
      by: ['kategoriId'],
      _count: true,
      where: startDate || endDate ? {
        tanggalSurat: dateFilter
      } : undefined
    });

    // Get kategori names
    const kategoris = await db.kategoriSurat.findMany();
    const kategoriMap = new Map(kategoris.map(k => [k.id, k.nama]));

    // Aggregate per kategori
    const kategoriCount = new Map<string, number>();
    
    suratMasukPerKategori.forEach(item => {
      const nama = item.kategoriId ? kategoriMap.get(item.kategoriId) || 'Tidak Berkategori' : 'Tidak Berkategori';
      kategoriCount.set(nama, (kategoriCount.get(nama) || 0) + item._count);
    });

    suratKeluarPerKategori.forEach(item => {
      const nama = item.kategoriId ? kategoriMap.get(item.kategoriId) || 'Tidak Berkategori' : 'Tidak Berkategori';
      kategoriCount.set(nama, (kategoriCount.get(nama) || 0) + item._count);
    });

    const perKategori = Array.from(kategoriCount.entries())
      .map(([kategori, jumlah]) => ({ kategori, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah);

    // Get surat per status (combined for masuk & keluar)
    const suratMasukPerStatus = await db.suratMasuk.groupBy({
      by: ['status'],
      _count: true,
      where: startDate || endDate ? {
        tanggalTerima: dateFilter
      } : undefined
    });

    const suratKeluarPerStatus = await db.suratKeluar.groupBy({
      by: ['status'],
      _count: true,
      where: startDate || endDate ? {
        tanggalSurat: dateFilter
      } : undefined
    });

    // Combine status counts (flat structure)
    const perStatus: Record<string, number> = {};
    suratMasukPerStatus.forEach(item => {
      perStatus[item.status] = (perStatus[item.status] || 0) + item._count;
    });
    suratKeluarPerStatus.forEach(item => {
      perStatus[item.status] = (perStatus[item.status] || 0) + item._count;
    });

    // Get disposisi per status
    const disposisiStatus = await db.disposisi.groupBy({
      by: ['status'],
      _count: true
    });

    const disposisiPerStatus: Record<string, number> = {};
    disposisiStatus.forEach(item => {
      disposisiPerStatus[item.status] = item._count;
    });

    // Get most active pengirim (surat masuk)
    const topPengirim = await db.suratMasuk.groupBy({
      by: ['pengirim'],
      _count: true,
      orderBy: {
        _count: {
          pengirim: 'desc'
        }
      },
      take: 5,
      where: startDate || endDate ? {
        tanggalTerima: dateFilter
      } : undefined
    });

    // Get most active tujuan (surat keluar)
    const topTujuan = await db.suratKeluar.groupBy({
      by: ['tujuan'],
      _count: true,
      orderBy: {
        _count: {
          tujuan: 'desc'
        }
      },
      take: 5,
      where: startDate || endDate ? {
        tanggalSurat: dateFilter
      } : undefined
    });

    // Get surat per sifat (combined)
    const suratMasukPerSifat = await db.suratMasuk.groupBy({
      by: ['sifat'],
      _count: true,
      where: startDate || endDate ? {
        tanggalTerima: dateFilter
      } : undefined
    });

    const suratKeluarPerSifat = await db.suratKeluar.groupBy({
      by: ['sifat'],
      _count: true,
      where: startDate || endDate ? {
        tanggalSurat: dateFilter
      } : undefined
    });

    // Combine sifat counts (flat structure)
    const perSifat: Record<string, number> = {};
    suratMasukPerSifat.forEach(item => {
      perSifat[item.sifat] = (perSifat[item.sifat] || 0) + item._count;
    });
    suratKeluarPerSifat.forEach(item => {
      perSifat[item.sifat] = (perSifat[item.sifat] || 0) + item._count;
    });

    // Get total arsip
    const totalArsip = await db.arsip.count();

    // Get total disposisi
    const totalDisposisi = await db.disposisi.count();

    // Get disposisi per prioritas
    const disposisiPerPrioritasData = await db.disposisi.groupBy({
      by: ['prioritas'],
      _count: true
    });

    const disposisiPerPrioritas: Record<string, number> = {};
    disposisiPerPrioritasData.forEach(item => {
      disposisiPerPrioritas[item.prioritas] = item._count;
    });

    return NextResponse.json({
      totalMasuk,
      totalKeluar,
      perBulan,
      perKategori,
      perStatus,
      perSifat,
      totalArsip,
      totalDisposisi,
      disposisiPerStatus,
      disposisiPerPrioritas,
      topPengirim: topPengirim.map(item => ({
        pengirim: item.pengirim,
        jumlah: item._count
      })),
      topTujuan: topTujuan.map(item => ({
        tujuan: item.tujuan,
        jumlah: item._count
      }))
    });
  } catch (error) {
    console.error('Error fetching statistik:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data statistik' },
      { status: 500 }
    );
  }
}
