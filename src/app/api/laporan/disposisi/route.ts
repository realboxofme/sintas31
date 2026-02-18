import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const prioritas = searchParams.get('prioritas');
    const suratMasukId = searchParams.get('suratMasukId');
    const dariUserId = searchParams.get('dariUserId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const exportAll = searchParams.get('export') === 'true';

    // Build where clause
    const where: Prisma.DisposisiWhereInput = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (status) {
      where.status = status;
    }

    if (prioritas) {
      where.prioritas = prioritas;
    }

    if (suratMasukId) {
      where.suratMasukId = suratMasukId;
    }

    if (dariUserId) {
      where.dariUserId = dariUserId;
    }

    // Get total count
    const total = await db.disposisi.count({ where });

    // Get data
    const data = await db.disposisi.findMany({
      where,
      include: {
        suratMasuk: {
          select: {
            id: true,
            noSurat: true,
            perihal: true,
            pengirim: true,
            tanggalSurat: true,
            sifat: true
          }
        },
        dariUser: {
          select: {
            id: true,
            name: true,
            email: true,
            jabatan: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(exportAll ? {} : {
        skip: (page - 1) * limit,
        take: limit
      })
    });

    // Calculate summary statistics
    const summary = await db.disposisi.aggregate({
      where,
      _count: true,
      _min: {
        createdAt: true
      },
      _max: {
        createdAt: true
      }
    });

    // Group by status
    const perStatus = await db.disposisi.groupBy({
      by: ['status'],
      _count: true,
      where
    });

    // Group by prioritas
    const perPrioritas = await db.disposisi.groupBy({
      by: ['prioritas'],
      _count: true,
      where
    });

    // Top pemberi disposisi
    const topPemberi = await db.disposisi.groupBy({
      by: ['dariUserId'],
      _count: true,
      where,
      orderBy: {
        _count: {
          dariUserId: 'desc'
        }
      },
      take: 5
    });

    // Get user names
    const userIds = topPemberi.map(item => item.dariUserId);
    const users = await db.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        name: true,
        jabatan: true
      }
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    // Top tujuan disposisi
    const topTujuan = await db.disposisi.groupBy({
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

    // Calculate average response time (disposisi yang selesai)
    const disposisiSelesai = await db.disposisi.findMany({
      where: {
        ...where,
        status: 'Selesai',
        updatedAt: {
          not: null
        }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    });

    let avgResponseTime = 0;
    if (disposisiSelesai.length > 0) {
      const totalDays = disposisiSelesai.reduce((sum, item) => {
        const created = new Date(item.createdAt).getTime();
        const updated = new Date(item.updatedAt).getTime();
        return sum + (updated - created) / (1000 * 60 * 60 * 24); // days
      }, 0);
      avgResponseTime = totalDays / disposisiSelesai.length;
    }

    // Disposisi dengan tenggat waktu terlewat
    const terlambat = await db.disposisi.count({
      where: {
        ...where,
        tenggatWaktu: {
          lt: new Date()
        },
        status: {
          not: 'Selesai'
        }
      }
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
          tanggalAwal: summary._min.createdAt,
          tanggalAkhir: summary._max.createdAt,
          avgResponseTime: Math.round(avgResponseTime * 10) / 10, // in days
          terlambat,
          perStatus: perStatus.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
          }, {} as Record<string, number>),
          perPrioritas: perPrioritas.reduce((acc, item) => {
            acc[item.prioritas] = item._count;
            return acc;
          }, {} as Record<string, number>),
          topPemberi: topPemberi.map(item => {
            const user = userMap.get(item.dariUserId);
            return {
              userId: item.dariUserId,
              name: user?.name || 'Unknown',
              jabatan: user?.jabatan,
              jumlah: item._count
            };
          }),
          topTujuan: topTujuan.map(item => ({
            tujuan: item.tujuan,
            jumlah: item._count
          }))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching disposisi report:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil laporan disposisi' },
      { status: 500 }
    );
  }
}
