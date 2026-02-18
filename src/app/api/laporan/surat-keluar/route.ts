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
    const tujuan = searchParams.get('tujuan');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const exportAll = searchParams.get('export') === 'true';

    // Build where clause
    const where: Prisma.SuratKeluarWhereInput = {};

    if (startDate || endDate) {
      where.tanggalSurat = {};
      if (startDate) {
        where.tanggalSurat.gte = new Date(startDate);
      }
      if (endDate) {
        where.tanggalSurat.lte = new Date(endDate);
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

    if (tujuan) {
      where.tujuan = {
        contains: tujuan,
        mode: 'insensitive'
      };
    }

    // Get total count
    const total = await db.suratKeluar.count({ where });

    // Get data
    const data = await db.suratKeluar.findMany({
      where,
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
            kode: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            jabatan: true
          }
        },
        arsip: {
          select: {
            id: true,
            noArsip: true,
            lokasi: true
          }
        }
      },
      orderBy: {
        tanggalSurat: 'desc'
      },
      ...(exportAll ? {} : {
        skip: (page - 1) * limit,
        take: limit
      })
    });

    // Calculate summary statistics
    const summary = await db.suratKeluar.aggregate({
      where,
      _count: true,
      _min: {
        tanggalSurat: true
      },
      _max: {
        tanggalSurat: true
      }
    });

    // Group by status
    const perStatus = await db.suratKeluar.groupBy({
      by: ['status'],
      _count: true,
      where
    });

    // Group by sifat
    const perSifat = await db.suratKeluar.groupBy({
      by: ['sifat'],
      _count: true,
      where
    });

    // Group by kategori
    const perKategori = await db.suratKeluar.groupBy({
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

    // Top tujuan
    const topTujuan = await db.suratKeluar.groupBy({
      by: ['tujuan'],
      _count: true,
      where,
      orderBy: {
        _count: {
          tujuan: 'desc'
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
          tanggalAwal: summary._min.tanggalSurat,
          tanggalAkhir: summary._max.tanggalSurat,
          perStatus: perStatus.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
          }, {} as Record<string, number>),
          perSifat: perSifat.reduce((acc, item) => {
            acc[item.sifat] = item._count;
            return acc;
          }, {} as Record<string, number>),
          perKategori: kategoriStats,
          topTujuan: topTujuan.map(item => ({
            tujuan: item.tujuan,
            jumlah: item._count
          }))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching surat keluar report:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil laporan surat keluar' },
      { status: 500 }
    );
  }
}
