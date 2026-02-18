import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch single surat keluar
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const suratKeluar = await db.suratKeluar.findUnique({
      where: { id },
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
    });

    if (!suratKeluar) {
      return NextResponse.json(
        { error: "Surat keluar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(suratKeluar);
  } catch (error) {
    console.error("Error fetching surat keluar:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data surat keluar" },
      { status: 500 }
    );
  }
}

// PUT - Update surat keluar
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if surat exists
    const existing = await db.suratKeluar.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Surat keluar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if noSurat is changed and already exists
    if (noSurat !== existing.noSurat) {
      const duplicateNoSurat = await db.suratKeluar.findFirst({
        where: { noSurat, NOT: { id } },
      });

      if (duplicateNoSurat) {
        return NextResponse.json(
          { error: "Nomor surat sudah digunakan" },
          { status: 400 }
        );
      }
    }

    const suratKeluar = await db.suratKeluar.update({
      where: { id },
      data: {
        noSurat,
        tanggalSurat: new Date(tanggalSurat),
        tujuan,
        perihal,
        lampiran: lampiran || null,
        sifat,
        status,
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

    return NextResponse.json(suratKeluar);
  } catch (error) {
    console.error("Error updating surat keluar:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui surat keluar" },
      { status: 500 }
    );
  }
}

// DELETE - Delete surat keluar
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if surat exists
    const existing = await db.suratKeluar.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Surat keluar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete surat keluar
    await db.suratKeluar.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Surat keluar berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting surat keluar:", error);
    return NextResponse.json(
      { error: "Gagal menghapus surat keluar" },
      { status: 500 }
    );
  }
}
