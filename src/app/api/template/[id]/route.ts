import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch single template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const template = await db.templateSurat.findUnique({
      where: { id },
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

    if (!template) {
      return NextResponse.json(
        { error: "Template tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data template" },
      { status: 500 }
    );
  }
}

// PUT - Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nama, kode, konten, kategoriId, isActive } = body;

    // Check if template exists
    const existing = await db.templateSurat.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Template tidak ditemukan" },
        { status: 404 }
      );
    }

    // If kode is being changed, check for duplicates
    if (kode && kode !== existing.kode) {
      const duplicateKode = await db.templateSurat.findFirst({
        where: { kode, id: { not: id } },
      });

      if (duplicateKode) {
        return NextResponse.json(
          { error: "Kode template sudah digunakan" },
          { status: 400 }
        );
      }
    }

    // If kategoriId provided, verify it exists
    if (kategoriId !== undefined && kategoriId !== null) {
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

    const updateData: any = {};
    
    if (nama !== undefined) updateData.nama = nama;
    if (kode !== undefined) updateData.kode = kode;
    if (konten !== undefined) updateData.konten = konten;
    if (kategoriId !== undefined) updateData.kategoriId = kategoriId || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const template = await db.templateSurat.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui template" },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if template exists
    const existing = await db.templateSurat.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Template tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.templateSurat.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Template berhasil dihapus",
      id,
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Gagal menghapus template" },
      { status: 500 }
    );
  }
}
