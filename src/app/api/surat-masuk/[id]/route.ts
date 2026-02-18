import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch single surat masuk
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const suratMasuk = await db.suratMasuk.findUnique({
      where: { id },
      include: {
        kategori: true,
        disposisi: true,
      },
    });

    if (!suratMasuk) {
      return NextResponse.json(
        { error: "Surat masuk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(suratMasuk);
  } catch (error) {
    console.error("Error fetching surat masuk:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data surat masuk" },
      { status: 500 }
    );
  }
}

// PUT - Update surat masuk
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

    // Check if surat exists
    const existing = await db.suratMasuk.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Surat masuk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if noSurat is changed and already exists
    if (noSurat !== existing.noSurat) {
      const duplicateNoSurat = await db.suratMasuk.findFirst({
        where: { noSurat, NOT: { id } },
      });

      if (duplicateNoSurat) {
        return NextResponse.json(
          { error: "Nomor surat sudah digunakan" },
          { status: 400 }
        );
      }
    }

    const suratMasuk = await db.suratMasuk.update({
      where: { id },
      data: {
        noSurat,
        tanggalSurat: new Date(tanggalSurat),
        pengirim,
        perihal,
        lampiran: lampiran || null,
        sifat,
        status,
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

    return NextResponse.json(suratMasuk);
  } catch (error) {
    console.error("Error updating surat masuk:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui surat masuk" },
      { status: 500 }
    );
  }
}

// DELETE - Delete surat masuk
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if surat exists
    const existing = await db.suratMasuk.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Surat masuk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete related disposisi first (cascade)
    await db.disposisi.deleteMany({
      where: { suratMasukId: id },
    });

    // Delete surat masuk
    await db.suratMasuk.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Surat masuk berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting surat masuk:", error);
    return NextResponse.json(
      { error: "Gagal menghapus surat masuk" },
      { status: 500 }
    );
  }
}
