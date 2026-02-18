import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const kategori = searchParams.get('kategori');
    const sifat = searchParams.get('sifat');
    const pengirim = searchParams.get('pengirim');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const exportAll = searchParams.get('export') === 'true';

    // Build where clause
    const where: Prisma.SuratMasukWhereInput = {};

    if (startDate || endDate) {
      where.tanggalTerima = {};
      if (startDate) {
        where.tanggalTerima.gte = new Date(startDate);
      }
      if (endDate) {
        where.tanggalTerima.lte = new Date(endDate);
      }
    }

    if (status) {
      where.status = status;
    }

    if (kategori) {
      where.kategoriId = kategori;
    }

    if (sifat) {
      where.sifat = sifat;
    }

    if (pengirim) {
      where.pengirim = {
        contains: pengirim,
        mode: 'insensitive'
      };
    }

    // Get total count
    const total = await db.suratMasuk.count({ where });

    // Get data
    const data = await db.suratMasuk.findMany({
      where,
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
            kode: true
          }
        },
        arsip: {
          select: {
            id: true,
            noArsip: true,
            lokasi: true
          }
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
        tanggalTerima: 'desc'
      },
      ...(exportAll ? {} : {
        skip: (page - 1) * limit,
        take: limit
      })
    });

    // Calculate summary statistics
    const summary = await db.suratMasuk.aggregate({
      where,
      _count: true,
      _min: {
        tanggalTerima: true
      },
      _max: {
        tanggalTerima: true
      }
    });

    // Group by status
    const perStatus = await db.suratMasuk.groupBy({
      by: ['status'],
      _count: true,
      where
    });

    // Group by sifat
    const perSifat = await db.suratMasuk.groupBy({
      by: ['sifat'],
      _count: true,
      where
    });

    // Group by kategori
    const perKategori = await db.suratMasuk.groupBy({
      by: ['kategoriId'],
      _count: true,
      where
    });

    // Get kategori names
    const kategoris = await db.kategoriSurat.findMany();
    const kategoriMap = new Map(kategoris.map(k => [k.id, k.nama]));

    const kategoriStats = perKategori.map(item => ({
      kategori: item.kategoriId ? kategoriMap.get(item.kategoriId) || 'Tidak Berkategori' : 'Tidak Berkategori',
      jumlah: item._count
    }));

    // Top pengirim
    const topPengirim = await db.suratMasuk.groupBy({
      by: ['pengirim'],
      _count: true,
      where,
      orderBy: {
        _count: {
          pengirim: 'desc'
        }
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: {
        items: data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        summary: {
          total: summary._count,
          tanggalAwal: summary._min.tanggalTerima,
          tanggalAkhir: summary._max.tanggalTerima,
          perStatus: perStatus.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
          }, {} as Record<string, number>),
          perSifat: perSifat.reduce((acc, item) => {
            acc[item.sifat] = item._count;
            return acc;
          }, {} as Record<string, number>),
          perKategori: kategoriStats,
          topPengirim: topPengirim.map(item => ({
            pengirim: item.pengirim,
            jumlah: item._count
          }))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching surat masuk report:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil laporan surat masuk' },
      { status: 500 }
    );
  }
}
