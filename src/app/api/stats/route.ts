import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [totalMasuk, totalKeluar, baruMasuk, draftKeluar, proses, selesai] = await Promise.all([
      db.suratMasuk.count(),
      db.suratKeluar.count(),
      db.suratMasuk.count({ where: { status: "Baru" } }),
      db.suratKeluar.count({ where: { status: "Draft" } }),
      db.suratMasuk.count({ where: { status: "Diproses" } }),
      db.suratMasuk.count({ where: { status: "Selesai" } }),
    ]);

    return NextResponse.json({
      totalMasuk,
      totalKeluar,
      baruMasuk,
      draftKeluar,
      proses,
      selesai,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik" },
      { status: 500 }
    );
  }
}
