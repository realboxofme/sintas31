import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategoriId = searchParams.get("kategoriId");
    const isActive = searchParams.get("isActive");

    const where: any = {};

    if (kategoriId) {
      where.kategoriId = kategoriId;
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const templates = await db.templateSurat.findMany({
      where,
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
      },
      orderBy: {
        nama: "asc",
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data template surat" },
      { status: 500 }
    );
  }
}

// POST - Create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, kode, konten, kategoriId, isActive } = body;

    // Validation
    if (!nama || !kode || !konten) {
      return NextResponse.json(
        { error: "Nama, kode, dan konten template harus diisi" },
        { status: 400 }
      );
    }

    // Check if kode already exists
    const existing = await db.templateSurat.findFirst({
      where: { kode },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Kode template sudah digunakan" },
        { status: 400 }
      );
    }

    // If kategoriId provided, verify it exists
    if (kategoriId) {
      const kategori = await db.kategoriSurat.findUnique({
        where: { id: kategoriId },
      });

      if (!kategori) {
        return NextResponse.json(
          { error: "Kategori tidak ditemukan" },
          { status: 400 }
        );
      }
    }

    const template = await db.templateSurat.create({
      data: {
        nama,
        kode,
        konten,
        kategoriId: kategoriId || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        kategori: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Gagal membuat template surat" },
      { status: 500 }
    );
  }
}
