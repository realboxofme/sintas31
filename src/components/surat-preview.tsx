"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, FileText } from "lucide-react";

interface SuratPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surat: {
    noSurat: string;
    tanggalSurat: string;
    tujuan: string;
    perihal: string;
    isiSurat?: string;
    lampiran?: string;
    sifat: string;
    kategori?: { nama: string } | null;
    // Tanda tangan fields
    tempatTtd?: string;
    jabatanTtd?: string;
    namaTtd?: string;
    nipTtd?: string;
    tembusan?: string;
  } | null;
}

export function SuratPreview({ open, onOpenChange, surat }: SuratPreviewProps) {
  if (!surat) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Default values untuk tanda tangan
  const tempat = surat.tempatTtd || "Jakarta";
  const jabatan = surat.jabatanTtd || "Kepala Bagian Administrasi";
  const nama = surat.namaTtd || "________________________";
  const nip = surat.nipTtd || "........................";
  const tembusanList = surat.tembusan || "1. Sekretaris Jenderal\n2. Arsip";

  // Parse tembusan untuk display
  const tembusanLines = tembusanList.split('\n').filter(line => line.trim());

  const handlePrint = () => {
    const printContent = document.getElementById("surat-print-content");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat - ${surat.noSurat}</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
          }
          .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header h1 {
            font-size: 14pt;
            margin: 0;
            font-weight: bold;
            text-transform: uppercase;
          }
          .header h2 {
            font-size: 12pt;
            margin: 5px 0;
            font-weight: bold;
          }
          .header p {
            font-size: 10pt;
            margin: 0;
          }
          .surat-info {
            margin-bottom: 20px;
          }
          .surat-info table {
            width: auto;
          }
          .surat-info td {
            padding: 2px 10px 2px 0;
            vertical-align: top;
          }
          .surat-info .label {
            width: 100px;
          }
          .content {
            text-align: justify;
          }
          .content p {
            margin-bottom: 10px;
          }
          .signature {
            margin-top: 40px;
            text-align: right;
          }
          .signature .name {
            font-weight: bold;
            text-decoration: underline;
          }
          .footer {
            margin-top: 30px;
            font-size: 10pt;
          }
          h1, h2, h3, h4, h5, h6 {
            font-weight: bold;
          }
          ul, ol {
            margin-left: 20px;
          }
          blockquote {
            border-left: 3px solid #000;
            padding-left: 15px;
            margin-left: 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KEMENTERIAN REPUBLIK INDONESIA</h1>
          <h2>DIREKTORAT JENDERAL PELAYANAN PUBLIK</h2>
          <p>Jl. Jenderal Sudirman No. 1, Jakarta Pusat 10110</p>
          <p>Telp: (021) 1234567, Fax: (021) 7654321</p>
        </div>
        
        <div class="surat-info">
          <table>
            <tr>
              <td class="label">Nomor</td>
              <td>: ${surat.noSurat}</td>
            </tr>
            <tr>
              <td class="label">Perihal</td>
              <td>: ${surat.perihal}</td>
            </tr>
            <tr>
              <td class="label">Tanggal</td>
              <td>: ${formatDate(surat.tanggalSurat)}</td>
            </tr>
            ${surat.lampiran ? `<tr><td class="label">Lampiran</td><td>: ${surat.lampiran}</td></tr>` : ''}
          </table>
        </div>
        
        <p><strong>Kepada Yth.</strong></p>
        <p>${surat.tujuan}</p>
        <p>di Tempat</p>
        
        <br/>
        
        <div class="content">
          ${surat.isiSurat || '<p>Isi surat belum diisi.</p>'}
        </div>
        
        <div class="signature">
          <p>${tempat}, ${formatDate(surat.tanggalSurat)}</p>
          <p>${jabatan}</p>
          <br/><br/><br/><br/>
          <p class="name">${nama}</p>
          <p>NIP. ${nip}</p>
        </div>
        
        <div class="footer">
          <p><strong>Tembusan:</strong></p>
          ${tembusanLines.map(line => `<p>${line}</p>`).join('')}
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownload = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Surat ${surat.noSurat}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #000; }
    .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { font-size: 14pt; margin: 0; font-weight: bold; text-transform: uppercase; }
    .header h2 { font-size: 12pt; margin: 5px 0; font-weight: bold; }
    .header p { font-size: 10pt; margin: 0; }
    .surat-info { margin-bottom: 20px; }
    .surat-info table { width: auto; }
    .surat-info td { padding: 2px 10px 2px 0; vertical-align: top; }
    .surat-info .label { width: 100px; }
    .content { text-align: justify; }
    .content p { margin-bottom: 10px; }
    .signature { margin-top: 40px; text-align: right; }
    .signature .name { font-weight: bold; text-decoration: underline; }
    .footer { margin-top: 30px; font-size: 10pt; }
  </style>
</head>
<body>
  <div class="header">
    <h1>KEMENTERIAN REPUBLIK INDONESIA</h1>
    <h2>DIREKTORAT JENDERAL PELAYANAN PUBLIK</h2>
    <p>Jl. Jenderal Sudirman No. 1, Jakarta Pusat 10110</p>
    <p>Telp: (021) 1234567, Fax: (021) 7654321</p>
  </div>
  
  <div class="surat-info">
    <table>
      <tr><td class="label">Nomor</td><td>: ${surat.noSurat}</td></tr>
      <tr><td class="label">Perihal</td><td>: ${surat.perihal}</td></tr>
      <tr><td class="label">Tanggal</td><td>: ${formatDate(surat.tanggalSurat)}</td></tr>
      ${surat.lampiran ? `<tr><td class="label">Lampiran</td><td>: ${surat.lampiran}</td></tr>` : ''}
    </table>
  </div>
  
  <p><strong>Kepada Yth.</strong></p>
  <p>${surat.tujuan}</p>
  <p>di Tempat</p>
  <br/>
  
  <div class="content">
    ${surat.isiSurat || '<p>Isi surat belum diisi.</p>'}
  </div>
  
  <div class="signature">
    <p>${tempat}, ${formatDate(surat.tanggalSurat)}</p>
    <p>${jabatan}</p>
    <br/><br/><br/><br/>
    <p class="name">${nama}</p>
    <p>NIP. ${nip}</p>
  </div>
  
  <div class="footer">
    <p><strong>Tembusan:</strong></p>
    ${tembusanLines.map(line => `<p>${line}</p>`).join('')}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Surat_${surat.noSurat.replace(/\//g, "-")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Preview Surat Keluar
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div 
          id="surat-print-content"
          className="bg-white border border-slate-200 p-8 shadow-sm"
          style={{ minHeight: "297mm", maxWidth: "210mm", margin: "0 auto" }}
        >
          {/* Header Kop Surat */}
          <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
            <h1 className="text-sm font-bold uppercase tracking-wide">KEMENTERIAN REPUBLIK INDONESIA</h1>
            <h2 className="text-xs font-bold mt-1">DIREKTORAT JENDERAL PELAYANAN PUBLIK</h2>
            <p className="text-xs mt-1">Jl. Jenderal Sudirman No. 1, Jakarta Pusat 10110</p>
            <p className="text-xs">Telp: (021) 1234567, Fax: (021) 7654321</p>
          </div>

          {/* Info Surat */}
          <div className="mb-6 text-sm">
            <table>
              <tbody>
                <tr>
                  <td className="pr-4 w-24">Nomor</td>
                  <td>: {surat.noSurat}</td>
                </tr>
                <tr>
                  <td className="pr-4">Perihal</td>
                  <td>: {surat.perihal}</td>
                </tr>
                <tr>
                  <td className="pr-4">Tanggal</td>
                  <td>: {formatDate(surat.tanggalSurat)}</td>
                </tr>
                {surat.lampiran && (
                  <tr>
                    <td className="pr-4">Lampiran</td>
                    <td>: {surat.lampiran}</td>
                  </tr>
                )}
                {surat.kategori && (
                  <tr>
                    <td className="pr-4">Kategori</td>
                    <td>: {surat.kategori.nama}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tujuan */}
          <div className="mb-6 text-sm">
            <p className="font-semibold">Kepada Yth.</p>
            <p>{surat.tujuan}</p>
            <p>di Tempat</p>
          </div>

          {/* Isi Surat */}
          <div 
            className="prose prose-sm max-w-none text-sm text-justify"
            dangerouslySetInnerHTML={{ __html: surat.isiSurat || "<p>Isi surat belum diisi.</p>" }}
          />

          {/* Tanda Tangan */}
          <div className="mt-12 text-sm text-right">
            <p>{tempat}, {formatDate(surat.tanggalSurat)}</p>
            <p>{jabatan}</p>
            <div className="h-20" />
            <p className="font-bold underline">{nama}</p>
            <p>NIP. {nip}</p>
          </div>

          {/* Footer - Tembusan */}
          <div className="mt-8 pt-4 border-t border-black text-xs">
            <p className="font-semibold">Tembusan:</p>
            {tembusanLines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
