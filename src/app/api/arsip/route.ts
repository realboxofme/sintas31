import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper function to generate noArsip
async function generateNoArsip(): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  // Find the last arsip for the current year
  const lastArsip = await db.arsip.findFirst({
    where: {
      noArsip: {
        startsWith: `AR/${currentYear}/`,
      },
    },
    orderBy: {
      noArsip: "desc",
    },
  });

  let nextNumber = 1;
  if (lastArsip) {
    const parts = lastArsip.noArsip.split("/");
    const lastNumber = parseInt(parts[2], 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Format: AR/YEAR/001
  const paddedNumber = nextNumber.toString().padStart(3, "0");
  return `AR/${currentYear}/${paddedNumber}`;
}

// GET - Fetch all arsip with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jenis = searchParams.get("jenis");
    const search = searchParams.get("search");

    // Build filter
    const where: Record<string, unknown> = {};
    if (jenis && (jenis === "Masuk" || jenis === "Keluar")) {
      where.jenis = jenis;
    }
    
    if (search) {
      where.OR = [
        { noArsip: { contains: search } },
        { keterangan: { contains: search } },
        { lokasi: { contains: search } },
      ];
    }

    const arsip = await db.arsip.findMany({
      where,
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
      orderBy: {
        tanggalArsip: "desc",
      },
    });

    return NextResponse.json(arsip);
  } catch (error) {
    console.error("Error fetching arsip:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data arsip" },
      { status: 500 }
    );
  }
}

// POST - Create new arsip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tanggalArsip,
      keterangan,
      lokasi,
      jenis,
      suratMasukId,
      suratKeluarId,
      fileUrl,
      fileName,
      fileSize,
      fileType,
    } = body;

    // Validation
    if (!jenis || (jenis !== "Masuk" && jenis !== "Keluar")) {
      return NextResponse.json(
        { error: "Jenis arsip harus 'Masuk' atau 'Keluar'" },
        { status: 400 }
      );
    }

    // Validate that either suratMasukId or suratKeluarId is provided based on jenis
    if (jenis === "Masuk" && !suratMasukId) {
      return NextResponse.json(
        { error: "suratMasukId wajib diisi untuk arsip jenis Masuk" },
        { status: 400 }
      );
    }

    if (jenis === "Keluar" && !suratKeluarId) {
      return NextResponse.json(
        { error: "suratKeluarId wajib diisi untuk arsip jenis Keluar" },
        { status: 400 }
      );
    }

    // Check if surat masuk exists and not already archived
    if (suratMasukId) {
      const suratMasuk = await db.suratMasuk.findUnique({
        where: { id: suratMasukId },
      });

      if (!suratMasuk) {
        return NextResponse.json(
          { error: "Surat masuk tidak ditemukan" },
          { status: 404 }
        );
      }

      // Check if already archived
      const existingArsip = await db.arsip.findUnique({
        where: { suratMasukId },
      });

      if (existingArsip) {
        return NextResponse.json(
          { error: "Surat masuk sudah diarsipkan" },
          { status: 400 }
        );
      }
    }

    // Check if surat keluar exists and not already archived
    if (suratKeluarId) {
      const suratKeluar = await db.suratKeluar.findUnique({
        where: { id: suratKeluarId },
      });

      if (!suratKeluar) {
        return NextResponse.json(
          { error: "Surat keluar tidak ditemukan" },
          { status: 404 }
        );
      }

      // Check if already archived
      const existingArsip = await db.arsip.findUnique({
        where: { suratKeluarId },
      });

      if (existingArsip) {
        return NextResponse.json(
          { error: "Surat keluar sudah diarsipkan" },
          { status: 400 }
        );
      }
    }

    // Generate noArsip
    const noArsip = await generateNoArsip();

    const arsip = await db.arsip.create({
      data: {
        noArsip,
        tanggalArsip: tanggalArsip ? new Date(tanggalArsip) : new Date(),
        keterangan: keterangan || null,
        lokasi: lokasi || null,
        jenis,
        suratMasukId: suratMasukId || null,
        suratKeluarId: suratKeluarId || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        fileType: fileType || null,
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

    // Update surat status to "Diarsipkan"
    if (suratMasukId) {
      await db.suratMasuk.update({
        where: { id: suratMasukId },
        data: { status: "Diarsipkan" },
      });
    }

    if (suratKeluarId) {
      await db.suratKeluar.update({
        where: { id: suratKeluarId },
        data: { status: "Diarsipkan" },
      });
    }

    return NextResponse.json(arsip, { status: 201 });
  } catch (error) {
    console.error("Error creating arsip:", error);
    return NextResponse.json(
      { error: "Gagal membuat arsip" },
      { status: 500 }
    );
  }
}
