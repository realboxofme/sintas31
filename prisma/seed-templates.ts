import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultTemplates = [
  {
    nama: "Template Surat Keputusan",
    kode: "TMPL-SK",
    konten: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 14pt; font-weight: bold; margin: 0; }
    .header h2 { font-size: 12pt; font-weight: bold; margin: 5px 0; }
    .header p { font-size: 10pt; margin: 2px 0; }
    .kop-line { border-top: 3px double #000; margin: 10px 0; }
    .content { margin: 20px 0; }
    .title { text-align: center; font-weight: bold; font-size: 12pt; margin: 20px 0; text-decoration: underline; }
    .metadata { margin: 20px 0; }
    .metadata p { margin: 5px 0; }
    .body-content { margin: 20px 0; text-align: justify; }
    .signature { margin-top: 40px; text-align: right; }
    .signature p { margin: 5px 0; }
    .signature-name { font-weight: bold; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="header">
    <h1>KEMENTERIAN CONTOH</h1>
    <h2>DIREKTORAT JENDERAL CONTOH</h2>
    <p>Jl. Contoh No. 1, Jakarta 10110</p>
    <p>Telp: (021) 1234567, Fax: (021) 7654321</p>
    <div class="kop-line"></div>
  </div>
  
  <div class="content">
    <div class="title">SURAT KEPUTUSAN</div>
    <div class="title" style="font-size: 11pt;">NOMOR: {{nomor_surat}}</div>
    
    <div class="body-content">
      <p style="text-align: center; font-weight: bold;">TENTANG</p>
      <p style="text-align: center; font-weight: bold;">{{perihal}}</p>
      <br/>
      <p><strong>KEPALA DIREKTORAT JENDERAL CONTOH,</strong></p>
      <p>Menimbang&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {{menimbang}}</p>
      <p>Mengingat&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {{mengingat}}</p>
      <br/>
      <p><strong>MEMUTUSKAN</strong></p>
      <br/>
      <p>Menetapkan&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {{menetapkan}}</p>
      <br/>
      <div>{{isi_surat}}</div>
    </div>
    
    <div class="signature">
      <p>Ditetapkan di &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {{tempat}}</p>
      <p>Pada tanggal &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {{tanggal}}</p>
      <br/><br/>
      <p>KEPALA DIREKTORAT JENDERAL CONTOH</p>
      <br/><br/><br/><br/>
      <p class="signature-name">{{nama_kepala}}</p>
      <p>NIP. {{nip_kepala}}</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    nama: "Template Surat Undangan",
    kode: "TMPL-SU",
    konten: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 14pt; font-weight: bold; margin: 0; }
    .header h2 { font-size: 12pt; font-weight: bold; margin: 5px 0; }
    .header p { font-size: 10pt; margin: 2px 0; }
    .kop-line { border-top: 3px double #000; margin: 10px 0; }
    .content { margin: 20px 0; }
    .letter-info { margin-bottom: 20px; }
    .letter-info table { width: 100%; }
    .letter-info td { padding: 2px 0; }
    .letter-info .label { width: 100px; }
    .recipient { margin: 20px 0; }
    .body-content { margin: 20px 0; text-align: justify; }
    .signature { margin-top: 40px; text-align: right; }
    .signature p { margin: 5px 0; }
    .signature-name { font-weight: bold; text-decoration: underline; }
    .tembusan { margin-top: 40px; font-size: 10pt; }
  </style>
</head>
<body>
  <div class="header">
    <h1>KEMENTERIAN CONTOH</h1>
    <h2>DIREKTORAT JENDERAL CONTOH</h2>
    <p>Jl. Contoh No. 1, Jakarta 10110</p>
    <p>Telp: (021) 1234567, Fax: (021) 7654321</p>
    <div class="kop-line"></div>
  </div>
  
  <div class="content">
    <div class="letter-info">
      <table>
        <tr>
          <td class="label">Nomor</td>
          <td>: {{nomor_surat}}</td>
        </tr>
        <tr>
          <td class="label">Sifat</td>
          <td>: {{sifat}}</td>
        </tr>
        <tr>
          <td class="label">Lampiran</td>
          <td>: {{lampiran}}</td>
        </tr>
        <tr>
          <td class="label">Perihal</td>
          <td>: <strong>{{perihal}}</strong></td>
        </tr>
      </table>
    </div>
    
    <div class="recipient">
      <p>Kepada Yth.</p>
      <p>{{tujuan}}</p>
      <p>di Tempat</p>
    </div>
    
    <div class="body-content">
      <p>Dengan hormat,</p>
      <p>{{isi_surat}}</p>
      <br/>
      <p>Demikian surat undangan ini disampaikan, atas perhatian dan kehadiran Saudara kami ucapkan terima kasih.</p>
    </div>
    
    <div class="signature">
      <p>{{tempat}}, {{tanggal}}</p>
      <p>{{jabatan_pengirim}}</p>
      <br/><br/><br/><br/>
      <p class="signature-name">{{nama_kepala}}</p>
      <p>NIP. {{nip_kepala}}</p>
    </div>
    
    <div class="tembusan">
      <p><strong>Tembusan:</strong></p>
      <ol>
        <li>Arsip</li>
      </ol>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    nama: "Template Surat Pemberitahuan",
    kode: "TMPL-SP",
    konten: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 14pt; font-weight: bold; margin: 0; }
    .header h2 { font-size: 12pt; font-weight: bold; margin: 5px 0; }
    .header p { font-size: 10pt; margin: 2px 0; }
    .kop-line { border-top: 3px double #000; margin: 10px 0; }
    .content { margin: 20px 0; }
    .letter-info { margin-bottom: 20px; }
    .letter-info table { width: 100%; }
    .letter-info td { padding: 2px 0; }
    .letter-info .label { width: 100px; }
    .recipient { margin: 20px 0; }
    .body-content { margin: 20px 0; text-align: justify; }
    .signature { margin-top: 40px; text-align: right; }
    .signature p { margin: 5px 0; }
    .signature-name { font-weight: bold; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="header">
    <h1>KEMENTERIAN CONTOH</h1>
    <h2>DIREKTORAT JENDERAL CONTOH</h2>
    <p>Jl. Contoh No. 1, Jakarta 10110</p>
    <p>Telp: (021) 1234567, Fax: (021) 7654321</p>
    <div class="kop-line"></div>
  </div>
  
  <div class="content">
    <div class="letter-info">
      <table>
        <tr>
          <td class="label">Nomor</td>
          <td>: {{nomor_surat}}</td>
        </tr>
        <tr>
          <td class="label">Perihal</td>
          <td>: <strong>{{perihal}}</strong></td>
        </tr>
        <tr>
          <td class="label">Tanggal</td>
          <td>: {{tanggal}}</td>
        </tr>
      </table>
    </div>
    
    <div class="recipient">
      <p>Kepada Yth.</p>
      <p>{{tujuan}}</p>
      <p>di Tempat</p>
    </div>
    
    <div class="body-content">
      <p>Dengan hormat,</p>
      <p>{{isi_surat}}</p>
      <br/>
      <p>Demikian pemberitahuan ini disampaikan untuk dapat dijadikan maklum.</p>
    </div>
    
    <div class="signature">
      <p>{{tempat}}, {{tanggal}}</p>
      <p>{{jabatan_pengirim}}</p>
      <br/><br/><br/><br/>
      <p class="signature-name">{{nama_kepala}}</p>
      <p>NIP. {{nip_kepala}}</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    nama: "Template Surat Permohonan",
    kode: "TMPL-SPM",
    konten: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 14pt; font-weight: bold; margin: 0; }
    .header h2 { font-size: 12pt; font-weight: bold; margin: 5px 0; }
    .header p { font-size: 10pt; margin: 2px 0; }
    .kop-line { border-top: 3px double #000; margin: 10px 0; }
    .content { margin: 20px 0; }
    .letter-info { margin-bottom: 20px; }
    .letter-info table { width: 100%; }
    .letter-info td { padding: 2px 0; }
    .letter-info .label { width: 100px; }
    .recipient { margin: 20px 0; }
    .body-content { margin: 20px 0; text-align: justify; }
    .signature { margin-top: 40px; text-align: right; }
    .signature p { margin: 5px 0; }
    .signature-name { font-weight: bold; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="header">
    <h1>KEMENTERIAN CONTOH</h1>
    <h2>DIREKTORAT JENDERAL CONTOH</h2>
    <p>Jl. Contoh No. 1, Jakarta 10110</p>
    <p>Telp: (021) 1234567, Fax: (021) 7654321</p>
    <div class="kop-line"></div>
  </div>
  
  <div class="content">
    <div class="letter-info">
      <table>
        <tr>
          <td class="label">Nomor</td>
          <td>: {{nomor_surat}}</td>
        </tr>
        <tr>
          <td class="label">Lampiran</td>
          <td>: {{lampiran}}</td>
        </tr>
        <tr>
          <td class="label">Perihal</td>
          <td>: <strong>{{perihal}}</strong></td>
        </tr>
      </table>
    </div>
    
    <div class="recipient">
      <p>Kepada Yth.</p>
      <p>{{tujuan}}</p>
      <p>di Tempat</p>
    </div>
    
    <div class="body-content">
      <p>Dengan hormat,</p>
      <p>{{isi_surat}}</p>
      <br/>
      <p>Besar harapan kami permohonan ini dapat dipertimbangkan. Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.</p>
    </div>
    
    <div class="signature">
      <p>{{tempat}}, {{tanggal}}</p>
      <p>{{jabatan_pengirim}}</p>
      <br/><br/><br/><br/>
      <p class="signature-name">{{nama_kepala}}</p>
      <p>NIP. {{nip_kepala}}</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    nama: "Template Surat Keterangan",
    kode: "TMPL-SKT",
    konten: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 14pt; font-weight: bold; margin: 0; }
    .header h2 { font-size: 12pt; font-weight: bold; margin: 5px 0; }
    .header p { font-size: 10pt; margin: 2px 0; }
    .kop-line { border-top: 3px double #000; margin: 10px 0; }
    .content { margin: 20px 0; }
    .title { text-align: center; font-weight: bold; font-size: 12pt; margin: 20px 0; text-decoration: underline; }
    .body-content { margin: 20px 0; text-align: justify; }
    .signature { margin-top: 40px; text-align: right; }
    .signature p { margin: 5px 0; }
    .signature-name { font-weight: bold; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="header">
    <h1>KEMENTERIAN CONTOH</h1>
    <h2>DIREKTORAT JENDERAL CONTOH</h2>
    <p>Jl. Contoh No. 1, Jakarta 10110</p>
    <p>Telp: (021) 1234567, Fax: (021) 7654321</p>
    <div class="kop-line"></div>
  </div>
  
  <div class="content">
    <div class="title">SURAT KETERANGAN</div>
    <div class="title" style="font-size: 11pt;">NOMOR: {{nomor_surat}}</div>
    
    <div class="body-content">
      <p>Yang bertanda tangan di bawah ini:</p>
      <table style="margin: 10px 0;">
        <tr>
          <td style="width: 150px;">Nama</td>
          <td>: {{nama_penandatangan}}</td>
        </tr>
        <tr>
          <td>NIP</td>
          <td>: {{nip_penandatangan}}</td>
        </tr>
        <tr>
          <td>Jabatan</td>
          <td>: {{jabatan_penandatangan}}</td>
        </tr>
      </table>
      <br/>
      <p>Dengan ini menerangkan bahwa:</p>
      <div>{{isi_surat}}</div>
      <br/>
      <p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
    </div>
    
    <div class="signature">
      <p>{{tempat}}, {{tanggal}}</p>
      <p>{{jabatan_penandatangan}}</p>
      <br/><br/><br/><br/>
      <p class="signature-name">{{nama_kepala}}</p>
      <p>NIP. {{nip_kepala}}</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    nama: "Template Surat Tugas",
    kode: "TMPL-ST",
    konten: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 14pt; font-weight: bold; margin: 0; }
    .header h2 { font-size: 12pt; font-weight: bold; margin: 5px 0; }
    .header p { font-size: 10pt; margin: 2px 0; }
    .kop-line { border-top: 3px double #000; margin: 10px 0; }
    .content { margin: 20px 0; }
    .title { text-align: center; font-weight: bold; font-size: 12pt; margin: 20px 0; text-decoration: underline; }
    .body-content { margin: 20px 0; text-align: justify; }
    .signature { margin-top: 40px; text-align: right; }
    .signature p { margin: 5px 0; }
    .signature-name { font-weight: bold; text-decoration: underline; }
    .pegawai-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .pegawai-table th, .pegawai-table td { border: 1px solid #000; padding: 5px 10px; }
    .pegawai-table th { background-color: #f0f0f0; text-align: center; }
    .pegawai-table .no-col { width: 40px; text-align: center; }
    .pegawai-table .nip-col { width: 120px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>KEMENTERIAN CONTOH</h1>
    <h2>DIREKTORAT JENDERAL CONTOH</h2>
    <p>Jl. Contoh No. 1, Jakarta 10110</p>
    <p>Telp: (021) 1234567, Fax: (021) 7654321</p>
    <div class="kop-line"></div>
  </div>
  
  <div class="content">
    <div class="title">SURAT TUGAS</div>
    <div class="title" style="font-size: 11pt;">NOMOR: {{nomor_surat}}</div>
    
    <div class="body-content">
      <p><strong>Yang bertanda tangan di bawah ini:</strong></p>
      <table style="margin: 10px 0;">
        <tr>
          <td style="width: 150px;">Nama</td>
          <td>: {{nama_penandatangan}}</td>
        </tr>
        <tr>
          <td>NIP</td>
          <td>: {{nip_penandatangan}}</td>
        </tr>
        <tr>
          <td>Jabatan</td>
          <td>: {{jabatan_penandatangan}}</td>
        </tr>
      </table>
      <br/>
      <p><strong>Memberikan tugas kepada:</strong></p>
      <table class="pegawai-table">
        <thead>
          <tr>
            <th class="no-col">No.</th>
            <th>NIP</th>
            <th>Nama</th>
            <th>Jabatan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="no-col">1</td>
            <td class="nip-col">{{nip_pegawai_1}}</td>
            <td>{{nama_pegawai_1}}</td>
            <td>{{jabatan_pegawai_1}}</td>
          </tr>
        </tbody>
      </table>
      <br/>
      <p><strong>Untuk:</strong> {{perihal}}</p>
      <br/>
      <p><strong>Hari/Tanggal</strong>&nbsp;&nbsp;: {{hari_tanggal}}</p>
      <p><strong>Tempat</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {{tempat_tugas}}</p>
      <br/>
      <div>{{isi_surat}}</div>
      <br/>
      <p>Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab.</p>
    </div>
    
    <div class="signature">
      <p>{{tempat}}, {{tanggal}}</p>
      <p>{{jabatan_penandatangan}}</p>
      <br/><br/><br/><br/>
      <p class="signature-name">{{nama_kepala}}</p>
      <p>NIP. {{nip_kepala}}</p>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
  {
    nama: "Template Surat Dinas",
    kode: "TMPL-SD",
    konten: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 14pt; font-weight: bold; margin: 0; }
    .header h2 { font-size: 12pt; font-weight: bold; margin: 5px 0; }
    .header p { font-size: 10pt; margin: 2px 0; }
    .kop-line { border-top: 3px double #000; margin: 10px 0; }
    .content { margin: 20px 0; }
    .letter-info { margin-bottom: 20px; }
    .letter-info table { width: 100%; }
    .letter-info td { padding: 2px 0; }
    .letter-info .label { width: 100px; }
    .recipient { margin: 20px 0; }
    .body-content { margin: 20px 0; text-align: justify; }
    .signature { margin-top: 40px; text-align: right; }
    .signature p { margin: 5px 0; }
    .signature-name { font-weight: bold; text-decoration: underline; }
    .tembusan { margin-top: 40px; font-size: 10pt; }
  </style>
</head>
<body>
  <div class="header">
    <h1>KEMENTERIAN CONTOH</h1>
    <h2>DIREKTORAT JENDERAL CONTOH</h2>
    <p>Jl. Contoh No. 1, Jakarta 10110</p>
    <p>Telp: (021) 1234567, Fax: (021) 7654321</p>
    <div class="kop-line"></div>
  </div>
  
  <div class="content">
    <div class="letter-info">
      <table>
        <tr>
          <td class="label">Nomor</td>
          <td>: {{nomor_surat}}</td>
        </tr>
        <tr>
          <td class="label">Sifat</td>
          <td>: {{sifat}}</td>
        </tr>
        <tr>
          <td class="label">Lampiran</td>
          <td>: {{lampiran}}</td>
        </tr>
        <tr>
          <td class="label">Perihal</td>
          <td>: <strong>{{perihal}}</strong></td>
        </tr>
      </table>
    </div>
    
    <div class="recipient">
      <p>Kepada Yth.</p>
      <p>{{tujuan}}</p>
      <p>di Tempat</p>
    </div>
    
    <div class="body-content">
      <p>Dengan hormat,</p>
      <p>{{isi_surat}}</p>
      <br/>
      <p>Demikian surat ini disampaikan untuk dilaksanakan sebagaimana mestinya.</p>
    </div>
    
    <div class="signature">
      <p>{{tempat}}, {{tanggal}}</p>
      <p>{{jabatan_pengirim}}</p>
      <br/><br/><br/><br/>
      <p class="signature-name">{{nama_kepala}}</p>
      <p>NIP. {{nip_kepala}}</p>
    </div>
    
    <div class="tembusan">
      <p><strong>Tembusan:</strong></p>
      <ol>
        <li>Arsip</li>
      </ol>
    </div>
  </div>
</body>
</html>`,
    isActive: true,
  },
];

async function main() {
  console.log("Starting template seeding...");

  for (const template of defaultTemplates) {
    const existing = await prisma.templateSurat.findFirst({
      where: { kode: template.kode },
    });

    if (existing) {
      console.log(`Template ${template.kode} already exists, skipping...`);
      continue;
    }

    await prisma.templateSurat.create({
      data: template,
    });

    console.log(`Created template: ${template.nama} (${template.kode})`);
  }

  console.log("Template seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
