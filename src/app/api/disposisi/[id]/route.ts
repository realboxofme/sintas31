import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch single disposisi
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const disposisi = await db.disposisi.findUnique({
      where: { id },
      include: {
        suratMasuk: {
          include: {
            kategori: true,
          },
        },
        dariUser: {
          select: {
            id: true,
            name: true,
            email: true,
            jabatan: true,
          },
        },
      },
    });

    if (!disposisi) {
      return NextResponse.json(
        { error: "Disposisi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(disposisi);
  } catch (error) {
    console.error("Error fetching disposisi:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data disposisi" },
      { status: 500 }
    );
  }
}

// PUT - Update disposisi
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      keUserId,
      tujuan,
      instruksi,
      status,
      tenggatWaktu,
      catatan,
      prioritas,
    } = body;

    // Check if disposisi exists
    const existing = await db.disposisi.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Disposisi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validate keUserId if provided
    if (keUserId) {
      const keUser = await db.user.findUnique({
        where: { id: keUserId },
      });
      if (!keUser) {
        return NextResponse.json(
          { error: "User tujuan disposisi tidak ditemukan" },
          { status: 404 }
        );
      }
    }

    const disposisi = await db.disposisi.update({
      where: { id },
      data: {
        keUserId: keUserId !== undefined ? keUserId : existing.keUserId,
        tujuan: tujuan || existing.tujuan,
        instruksi: instruksi || existing.instruksi,
        status: status || existing.status,
        tenggatWaktu: tenggatWaktu !== undefined ? (tenggatWaktu ? new Date(tenggatWaktu) : null) : existing.tenggatWaktu,
        catatan: catatan !== undefined ? catatan : existing.catatan,
        prioritas: prioritas || existing.prioritas,
      },
      include: {
        suratMasuk: {
          include: {
            kategori: true,
          },
        },
        dariUser: {
          select: {
            id: true,
            name: true,
            email: true,
            jabatan: true,
          },
        },
      },
    });

    // If status is "Selesai", check if all disposisi for this surat is complete
    if (status === "Selesai") {
      const allDisposisi = await db.disposisi.findMany({
        where: { suratMasukId: existing.suratMasukId },
      });
      
      const allSelesai = allDisposisi.every(d => d.status === "Selesai" || d.id === id);
      
      if (allSelesai) {
        await db.suratMasuk.update({
          where: { id: existing.suratMasukId },
          data: { status: "Selesai" },
        });
      }
    }

    return NextResponse.json(disposisi);
  } catch (error) {
    console.error("Error updating disposisi:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui disposisi" },
      { status: 500 }
    );
  }
}

// DELETE - Delete disposisi
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if disposisi exists
    const existing = await db.disposisi.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Disposisi tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.disposisi.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Disposisi berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting disposisi:", error);
    return NextResponse.json(
      { error: "Gagal menghapus disposisi" },
      { status: 500 }
    );
  }
}
