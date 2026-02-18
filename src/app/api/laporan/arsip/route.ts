import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const jenis = searchParams.get('jenis'); // Masuk, Keluar
    const lokasi = searchParams.get('lokasi');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const exportAll = searchParams.get('export') === 'true';

    // Build where clause
    const where: Prisma.ArsipWhereInput = {};

    if (startDate || endDate) {
      where.tanggalArsip = {};
      if (startDate) {
        where.tanggalArsip.gte = new Date(startDate);
      }
      if (endDate) {
        where.tanggalArsip.lte = new Date(endDate);
      }
    }

    if (jenis) {
      where.jenis = jenis;
    }

    if (lokasi) {
      where.lokasi = {
        contains: lokasi,
        mode: 'insensitive'
      };
    }

    // Get total count
    const total = await db.arsip.count({ where });

    // Get data
    const data = await db.arsip.findMany({
      where,
      include: {
        suratMasuk: {
          select: {
            id: true,
            noSurat: true,
            perihal: true,
            pengirim: true,
            tanggalSurat: true,
            sifat: true,
            kategori: {
              select: {
                id: true,
                nama: true
              }
            }
          }
        },
        suratKeluar: {
          select: {
            id: true,
            noSurat: true,
            perihal: true,
            tujuan: true,
            tanggalSurat: true,
            sifat: true,
            kategori: {
              select: {
                id: true,
                nama: true
              }
            }
          }
        }
      },
      orderBy: {
        tanggalArsip: 'desc'
      },
      ...(exportAll ? {} : {
        skip: (page - 1) * limit,
        take: limit
      })
    });

    // Calculate summary statistics
    const summary = await db.arsip.aggregate({
      where,
      _count: true,
      _min: {
        tanggalArsip: true,
        tanggalSurat: true
      },
      _max: {
        tanggalArsip: true,
        tanggalSurat: true
      }
    });

    // Group by jenis
    const perJenis = await db.arsip.groupBy({
      by: ['jenis'],
      _count: true,
      where
    });

    // Group by lokasi
    const perLokasi = await db.arsip.groupBy({
      by: ['lokasi'],
      _count: true,
      where: {
        ...where,
        lokasi: {
          not: null
        }
      },
      orderBy: {
        _count: {
          lokasi: 'desc'
        }
      }
    });

    // Get surat masuk yang belum diarsipkan
    const suratMasukBelumArsip = await db.suratMasuk.count({
      where: {
        status: 'Selesai',
        arsip: null
      }
    });

    // Get surat keluar yang belum diarsipkan
    const suratKeluarBelumArsip = await db.suratKeluar.count({
      where: {
        status: 'Dikirim',
        arsip: null
      }
    });

    // Arsip per bulan tahun ini
    const tahun = new Date().getFullYear();
    const arsipPerBulan = await db.arsip.findMany({
      where: {
        tanggalArsip: {
          gte: new Date(`${tahun}-01-01`),
          lte: new Date(`${tahun}-12-31`)
        }
      },
      select: {
        tanggalArsip: true,
        jenis: true
      }
    });

    const BULAN_INDONESIA = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const perBulan = BULAN_INDONESIA.map((bulan, index) => {
      const masuk = arsipPerBulan.filter(
        item => new Date(item.tanggalArsip).getMonth() === index && item.jenis === 'Masuk'
      ).length;
      const keluar = arsipPerBulan.filter(
        item => new Date(item.tanggalArsip).getMonth() === index && item.jenis === 'Keluar'
      ).length;
      return { bulan, masuk, keluar };
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
          tanggalAwal: summary._min.tanggalArsip,
          tanggalAkhir: summary._max.tanggalArsip,
          suratMasukBelumArsip,
          suratKeluarBelumArsip,
          perJenis: perJenis.reduce((acc, item) => {
            acc[item.jenis] = item._count;
            return acc;
          }, {} as Record<string, number>),
          perLokasi: perLokasi.filter(item => item.lokasi).map(item => ({
            lokasi: item.lokasi!,
            jumlah: item._count
          })),
          perBulan
        }
      }
    });
  } catch (error) {
    console.error('Error fetching arsip report:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil laporan arsip' },
      { status: 500 }
    );
  }
}
