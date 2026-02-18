import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const BULAN_ROMAWI = [
  'I', 'II', 'III', 'IV', 'V', 'VI',
  'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
];

export async function GET() {
  try {
    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = now.getMonth(); // 0-indexed
    const bulanRomawi = BULAN_ROMAWI[bulan];

    // Get all surat keluar for this month/year to determine the next number
    const suratKeluarBulanIni = await db.suratKeluar.findMany({
      where: {
        tanggalSurat: {
          gte: new Date(tahun, bulan, 1),
          lt: new Date(tahun, bulan + 1, 1),
        },
      },
      select: {
        noSurat: true,
      },
    });

    // Extract numbers from existing nomor surat
    let maxNumber = 0;
    suratKeluarBulanIni.forEach((surat) => {
      // Try to extract the leading number from the nomor surat
      const match = surat.noSurat.match(/^(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    // Generate the next number
    const nextNumber = maxNumber + 1;
    const nomorUrut = String(nextNumber).padStart(3, '0');

    // Format: 001/OUT/MM/YYYY
    const noSurat = `${nomorUrut}/OUT/${bulanRomawi}/${tahun}`;

    return NextResponse.json({ noSurat });
  } catch (error) {
    console.error('Error generating nomor surat:', error);
    return NextResponse.json(
      { error: 'Gagal membuat nomor surat otomatis' },
      { status: 500 }
    );
  }
}
