import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch all surat masuk
export async function GET() {
  try {
    const suratMasuk = await db.suratMasuk.findMany({
      include: {
        kategori: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(suratMasuk);
  } catch (error) {
    console.error("Error fetching surat masuk:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data surat masuk" },
      { status: 500 }
    );
  }
}

// POST - Create new surat masuk
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      noSurat,
      tanggalSurat,
      pengirim,
      perihal,
      lampiran,
      sifat,
      status,
      keterangan,
      kategoriId,
      fileUrl,
      fileName,
      fileSize,
      fileType,
    } = body;

    // Validation
    if (!noSurat || !tanggalSurat || !pengirim || !perihal) {
      return NextResponse.json(
        { error: "Field wajib harus diisi" },
        { status: 400 }
      );
    }

    // Check if noSurat already exists
    const existing = await db.suratMasuk.findFirst({
      where: { noSurat },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Nomor surat sudah terdaftar" },
        { status: 400 }
      );
    }

    const suratMasuk = await db.suratMasuk.create({
      data: {
        noSurat,
        tanggalSurat: new Date(tanggalSurat),
        pengirim,
        perihal,
        lampiran: lampiran || null,
        sifat: sifat || "Biasa",
        status: status || "Baru",
        keterangan: keterangan || null,
        kategoriId: kategoriId || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        fileType: fileType || null,
      },
      include: {
        kategori: true,
      },
    });

    return NextResponse.json(suratMasuk, { status: 201 });
  } catch (error) {
    console.error("Error creating surat masuk:", error);
    return NextResponse.json(
      { error: "Gagal membuat surat masuk" },
      { status: 500 }
    );
  }
}
