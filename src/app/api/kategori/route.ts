import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch all kategori
export async function GET() {
  try {
    const kategori = await db.kategoriSurat.findMany({
      orderBy: {
        nama: "asc",
      },
    });

    return NextResponse.json(kategori);
  } catch (error) {
    console.error("Error fetching kategori:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kategori" },
      { status: 500 }
    );
  }
}

// POST - Create new kategori
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, kode, keterangan } = body;

    // Validation
    if (!nama || !kode) {
      return NextResponse.json(
        { error: "Nama dan kode kategori harus diisi" },
        { status: 400 }
      );
    }

    // Check if kode already exists
    const existing = await db.kategoriSurat.findFirst({
      where: { kode },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Kode kategori sudah digunakan" },
        { status: 400 }
      );
    }

    const kategori = await db.kategoriSurat.create({
      data: {
        nama,
        kode,
        keterangan: keterangan || null,
      },
    });

    return NextResponse.json(kategori, { status: 201 });
  } catch (error) {
    console.error("Error creating kategori:", error);
    return NextResponse.json(
      { error: "Gagal membuat kategori" },
      { status: 500 }
    );
  }
}
