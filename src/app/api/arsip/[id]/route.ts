import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch single arsip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const arsip = await db.arsip.findUnique({
      where: { id },
      include: {
        suratMasuk: {
          include: {
            kategori: true,
            disposisi: {
              include: {
                dariUser: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    jabatan: true,
                  },
                },
              },
            },
          },
        },
        suratKeluar: {
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
        },
      },
    });

    if (!arsip) {
      return NextResponse.json(
        { error: "Arsip tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(arsip);
  } catch (error) {
    console.error("Error fetching arsip:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data arsip" },
      { status: 500 }
    );
  }
}

// PUT - Update arsip
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      tanggalArsip,
      keterangan,
      lokasi,
    } = body;

    // Check if arsip exists
    const existing = await db.arsip.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Arsip tidak ditemukan" },
        { status: 404 }
      );
    }

    const arsip = await db.arsip.update({
      where: { id },
      data: {
        tanggalArsip: tanggalArsip ? new Date(tanggalArsip) : existing.tanggalArsip,
        keterangan: keterangan !== undefined ? keterangan : existing.keterangan,
        lokasi: lokasi !== undefined ? lokasi : existing.lokasi,
      },
      include: {
        suratMasuk: {
          include: {
            kategori: true,
          },
        },
        suratKeluar: {
          include: {
            kategori: true,
          },
        },
      },
    });

    return NextResponse.json(arsip);
  } catch (error) {
    console.error("Error updating arsip:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui arsip" },
      { status: 500 }
    );
  }
}

// DELETE - Delete arsip
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if arsip exists
    const existing = await db.arsip.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Arsip tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update related surat status before deleting arsip
    if (existing.suratMasukId) {
      await db.suratMasuk.update({
        where: { id: existing.suratMasukId },
        data: { status: "Selesai" }, // Reset to Selesai status
      });
    }

    if (existing.suratKeluarId) {
      await db.suratKeluar.update({
        where: { id: existing.suratKeluarId },
        data: { status: "Dikirim" }, // Reset to Dikirim status
      });
    }

    await db.arsip.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Arsip berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting arsip:", error);
    return NextResponse.json(
      { error: "Gagal menghapus arsip" },
      { status: 500 }
    );
  }
}
