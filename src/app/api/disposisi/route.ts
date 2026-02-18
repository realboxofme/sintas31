import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch all disposisi with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const suratMasukId = searchParams.get("suratMasukId");
    const status = searchParams.get("status");
    const keUserId = searchParams.get("keUserId");
    const dariUserId = searchParams.get("dariUserId");

    // Build filter
    const where: Record<string, unknown> = {};
    if (suratMasukId) where.suratMasukId = suratMasukId;
    if (status) where.status = status;
    if (keUserId) where.keUserId = keUserId;
    if (dariUserId) where.dariUserId = dariUserId;

    const disposisi = await db.disposisi.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(disposisi);
  } catch (error) {
    console.error("Error fetching disposisi:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data disposisi" },
      { status: 500 }
    );
  }
}

// POST - Create new disposisi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      suratMasukId,
      dariUserId,
      keUserId,
      tujuan,
      instruksi,
      status,
      tenggatWaktu,
      catatan,
      prioritas,
    } = body;

    // Validation
    if (!suratMasukId || !dariUserId || !tujuan || !instruksi) {
      return NextResponse.json(
        { error: "Field wajib harus diisi (suratMasukId, dariUserId, tujuan, instruksi)" },
        { status: 400 }
      );
    }

    // Check if surat masuk exists
    const suratMasuk = await db.suratMasuk.findUnique({
      where: { id: suratMasukId },
    });

    if (!suratMasuk) {
      return NextResponse.json(
        { error: "Surat masuk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if dari user exists
    const dariUser = await db.user.findUnique({
      where: { id: dariUserId },
    });

    if (!dariUser) {
      return NextResponse.json(
        { error: "User pengirim disposisi tidak ditemukan" },
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

    const disposisi = await db.disposisi.create({
      data: {
        suratMasukId,
        dariUserId,
        keUserId: keUserId || null,
        tujuan,
        instruksi,
        status: status || "Belum Diproses",
        tenggatWaktu: tenggatWaktu ? new Date(tenggatWaktu) : null,
        catatan: catatan || null,
        prioritas: prioritas || "Normal",
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

    // Update surat masuk status to "Diproses"
    await db.suratMasuk.update({
      where: { id: suratMasukId },
      data: { status: "Diproses" },
    });

    return NextResponse.json(disposisi, { status: 201 });
  } catch (error) {
    console.error("Error creating disposisi:", error);
    return NextResponse.json(
      { error: "Gagal membuat disposisi" },
      { status: 500 }
    );
  }
}
