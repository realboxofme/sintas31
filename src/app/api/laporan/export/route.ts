import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const workbook = XLSX.utils.book_new();

    // Date filter
    const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate);
    }

    // Export Surat Masuk
    if (type === "all" || type === "masuk") {
      const suratMasuk = await db.suratMasuk.findMany({
        where: dateFilter,
        include: { kategori: true },
        orderBy: { createdAt: "desc" },
      });

      const masukData = suratMasuk.map((s, index) => ({
        No: index + 1,
        "Nomor Surat": s.noSurat,
        "Tanggal Surat": new Date(s.tanggalSurat).toLocaleDateString("id-ID"),
        "Tanggal Terima": new Date(s.tanggalTerima).toLocaleDateString("id-ID"),
        Pengirim: s.pengirim,
        Perihal: s.perihal,
        Kategori: s.kategori?.nama || "-",
        Sifat: s.sifat,
        Status: s.status,
        Lampiran: s.lampiran || "-",
        Keterangan: s.keterangan || "-",
      }));

      const masukSheet = XLSX.utils.json_to_sheet(masukData);
      XLSX.utils.book_append_sheet(workbook, masukSheet, "Surat Masuk");
    }

    // Export Surat Keluar
    if (type === "all" || type === "keluar") {
      const suratKeluar = await db.suratKeluar.findMany({
        where: dateFilter,
        include: { kategori: true },
        orderBy: { createdAt: "desc" },
      });

      const keluarData = suratKeluar.map((s, index) => ({
        No: index + 1,
        "Nomor Surat": s.noSurat,
        "Tanggal Surat": new Date(s.tanggalSurat).toLocaleDateString("id-ID"),
        Tujuan: s.tujuan,
        Perihal: s.perihal,
        Kategori: s.kategori?.nama || "-",
        Sifat: s.sifat,
        Status: s.status,
        Lampiran: s.lampiran || "-",
        Keterangan: s.keterangan || "-",
      }));

      const keluarSheet = XLSX.utils.json_to_sheet(keluarData);
      XLSX.utils.book_append_sheet(workbook, keluarSheet, "Surat Keluar");
    }

    // Export Disposisi
    if (type === "all" || type === "disposisi") {
      const disposisi = await db.disposisi.findMany({
        where: dateFilter,
        include: {
          suratMasuk: { select: { noSurat: true, perihal: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const disposisiData = disposisi.map((d, index) => ({
        No: index + 1,
        "Nomor Surat": d.suratMasuk?.noSurat || "-",
        "Perihal Surat": d.suratMasuk?.perihal || "-",
        Tujuan: d.tujuan,
        Instruksi: d.instruksi,
        Prioritas: d.prioritas,
        Status: d.status,
        "Tenggat Waktu": d.tenggatWaktu 
          ? new Date(d.tenggatWaktu).toLocaleDateString("id-ID") 
          : "-",
        Catatan: d.catatan || "-",
      }));

      const disposisiSheet = XLSX.utils.json_to_sheet(disposisiData);
      XLSX.utils.book_append_sheet(workbook, disposisiSheet, "Disposisi");
    }

    // Export Arsip
    if (type === "all" || type === "arsip") {
      const arsip = await db.arsip.findMany({
        where: dateFilter,
        orderBy: { tanggalArsip: "desc" },
      });

      const arsipData = arsip.map((a, index) => ({
        No: index + 1,
        "Nomor Arsip": a.noArsip,
        Jenis: a.jenis,
        "Nomor Surat": a.suratMasukId || a.suratKeluarId || "-",
        "Tanggal Arsip": new Date(a.tanggalArsip).toLocaleDateString("id-ID"),
        Lokasi: a.lokasi || "-",
        Keterangan: a.keterangan || "-",
      }));

      const arsipSheet = XLSX.utils.json_to_sheet(arsipData);
      XLSX.utils.book_append_sheet(workbook, arsipSheet, "Arsip");
    }

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Return as downloadable file
    const date = new Date().toISOString().split("T")[0];
    const filename = `Laporan_SINTAS_${date}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return NextResponse.json(
      { error: "Gagal mengekspor data" },
      { status: 500 }
    );
  }
}
