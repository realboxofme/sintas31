import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch all surat keluar
export async function GET() {
  try {
    const suratKeluar = await db.suratKeluar.findMany({
      include: {
        kategori: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            jabatan: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(suratKeluar);
  } catch (error) {
    console.error("Error fetching surat keluar:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data surat keluar" },
      { status: 500 }
    );
  }
}

// POST - Create new surat keluar
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      noSurat,
      tanggalSurat,
      tujuan,
      perihal,
      lampiran,
      sifat,
      status,
      keterangan,
      kategoriId,
      isiSurat,
      tempatTtd,
      jabatanTtd,
      namaTtd,
      nipTtd,
      tembusan,
    } = body;

    // Validation
    if (!noSurat || !tanggalSurat || !tujuan || !perihal) {
      return NextResponse.json(
        { error: "Field wajib harus diisi" },
        { status: 400 }
      );
    }

    // Check if noSurat already exists
    const existing = await db.suratKeluar.findFirst({
      where: { noSurat },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Nomor surat sudah terdaftar" },
        { status: 400 }
      );
    }

    const suratKeluar = await db.suratKeluar.create({
      data: {
        noSurat,
        tanggalSurat: new Date(tanggalSurat),
        tujuan,
        perihal,
        lampiran: lampiran || null,
        sifat: sifat || "Biasa",
        status: status || "Draft",
        keterangan: keterangan || null,
        kategoriId: kategoriId || null,
        isiSurat: isiSurat || null,
        tempatTtd: tempatTtd || null,
        jabatanTtd: jabatanTtd || null,
        namaTtd: namaTtd || null,
        nipTtd: nipTtd || null,
        tembusan: tembusan || null,
      },
      include: {
        kategori: true,
      },
    });

    return NextResponse.json(suratKeluar, { status: 201 });
  } catch (error) {
    console.error("Error creating surat keluar:", error);
    return NextResponse.json(
      { error: "Gagal membuat surat keluar" },
      { status: 500 }
    );
  }
}
