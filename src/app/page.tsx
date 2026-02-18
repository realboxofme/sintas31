"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, MailOpen, Send, FileText, Users, Clock, Plus, Pencil, Trash2, 
  Search, Filter, Calendar, Building2, AlertCircle, LayoutDashboard, 
  Archive, FileEdit, BarChart3, LogOut, User as UserIcon, Lock, 
  ChevronRight, CheckCircle2, AlertTriangle, Eye, Printer, Download,
  RefreshCw, FileSpreadsheet, Upload, Paperclip, X, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { RichTextEditor } from "@/components/rich-text-editor";
import { SuratPreview } from "@/components/surat-preview";

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  jabatan?: string;
  nip?: string;
  phone?: string;
  isActive: boolean;
}

interface SuratMasuk {
  id: string;
  noSurat: string;
  tanggalSurat: string;
  tanggalTerima: string;
  pengirim: string;
  perihal: string;
  lampiran?: string;
  sifat: string;
  status: string;
  keterangan?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  kategoriId?: string;
  kategori?: { id: string; nama: string; kode: string };
  disposisi?: Disposisi[];
  arsip?: Arsip;
  createdAt: string;
  updatedAt: string;
}

interface SuratKeluar {
  id: string;
  noSurat: string;
  tanggalSurat: string;
  tujuan: string;
  perihal: string;
  lampiran?: string;
  sifat: string;
  status: string;
  keterangan?: string;
  fileUrl?: string;
  isiSurat?: string;
  // Tanda tangan fields
  tempatTtd?: string;
  jabatanTtd?: string;
  namaTtd?: string;
  nipTtd?: string;
  tembusan?: string;
  kategoriId?: string;
  kategori?: { id: string; nama: string; kode: string };
  author?: User;
  arsip?: Arsip;
  createdAt: string;
  updatedAt: string;
}

interface Disposisi {
  id: string;
  suratMasukId: string;
  dariUserId: string;
  keUserId?: string;
  tujuan: string;
  instruksi: string;
  status: string;
  tenggatWaktu?: string;
  catatan?: string;
  prioritas: string;
  dariUser?: User;
  createdAt: string;
}

interface Arsip {
  id: string;
  noArsip: string;
  tanggalArsip: string;
  keterangan?: string;
  lokasi?: string;
  jenis: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  suratMasukId?: string;
  suratKeluarId?: string;
  suratMasuk?: SuratMasuk;
  suratKeluar?: SuratKeluar;
}

interface Template {
  id: string;
  nama: string;
  kode: string;
  konten: string;
  kategoriId?: string;
  kategori?: { id: string; nama: string; kode: string };
  isActive: boolean;
}

interface Kategori {
  id: string;
  nama: string;
  kode: string;
  keterangan?: string;
}

interface Stats {
  totalMasuk: number;
  totalKeluar: number;
  baruMasuk: number;
  draftKeluar: number;
  proses: number;
  selesai: number;
}

interface LaporanStatistik {
  totalMasuk: number;
  totalKeluar: number;
  totalArsip: number;
  totalDisposisi: number;
  perBulan: { bulan: string; masuk: number; keluar: number }[];
  perKategori: { kategori: string; jumlah: number }[];
  perStatus: Record<string, number>;
  perSifat: Record<string, number>;
  disposisiPerStatus: Record<string, number>;
  disposisiPerPrioritas: Record<string, number>;
  topPengirim: { pengirim: string; jumlah: number }[];
  topTujuan: { tujuan: string; jumlah: number }[];
}

// Status & Sifat colors
const statusColors: Record<string, string> = {
  "Baru": "bg-blue-500",
  "Diproses": "bg-yellow-500",
  "Selesai": "bg-green-500",
  "Diarsipkan": "bg-gray-500",
  "Draft": "bg-gray-400",
  "Dikirim": "bg-green-500",
  "Belum Diproses": "bg-red-500",
  "Sedang Diproses": "bg-yellow-500",
};

const sifatColors: Record<string, string> = {
  "Biasa": "bg-gray-100 text-gray-800",
  "Segera": "bg-yellow-100 text-yellow-800",
  "Sangat Segera": "bg-red-100 text-red-800",
  "Rahasia": "bg-purple-100 text-purple-800",
};

const prioritasColors: Record<string, string> = {
  "Rendah": "bg-gray-100 text-gray-800",
  "Normal": "bg-blue-100 text-blue-800",
  "Tinggi": "bg-orange-100 text-orange-800",
  "Urgent": "bg-red-100 text-red-800",
};

export default function SINTASApp() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Navigation
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  // Data States
  const [suratMasuk, setSuratMasuk] = useState<SuratMasuk[]>([]);
  const [suratKeluar, setSuratKeluar] = useState<SuratKeluar[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [disposisi, setDisposisi] = useState<Disposisi[]>([]);
  const [arsip, setArsip] = useState<Arsip[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<Stats>({ totalMasuk: 0, totalKeluar: 0, baruMasuk: 0, draftKeluar: 0, proses: 0, selesai: 0 });
  const [laporanStatistik, setLaporanStatistik] = useState<LaporanStatistik | null>(null);

  // Search & Filter
  const [searchMasuk, setSearchMasuk] = useState("");
  const [searchKeluar, setSearchKeluar] = useState("");
  const [filterStatusMasuk, setFilterStatusMasuk] = useState("all");
  const [filterStatusKeluar, setFilterStatusKeluar] = useState("all");

  // Modal States
  const [showMasukModal, setShowMasukModal] = useState(false);
  const [showKeluarModal, setShowKeluarModal] = useState(false);
  const [showDisposisiModal, setShowDisposisiModal] = useState(false);
  const [showArsipModal, setShowArsipModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSurat, setPreviewSurat] = useState<SuratKeluar | null>(null);

  // Editing States
  const [editingMasuk, setEditingMasuk] = useState<SuratMasuk | null>(null);
  const [editingKeluar, setEditingKeluar] = useState<SuratKeluar | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [selectedSuratMasuk, setSelectedSuratMasuk] = useState<SuratMasuk | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingType, setDeletingType] = useState<string | null>(null);

  // Form States
  const [formDataMasuk, setFormDataMasuk] = useState({
    noSurat: "", tanggalSurat: "", pengirim: "", perihal: "",
    lampiran: "", sifat: "Biasa", status: "Baru", keterangan: "", kategoriId: "",
    fileUrl: "", fileName: "", fileSize: 0, fileType: "",
  });
  const [formDataKeluar, setFormDataKeluar] = useState({
    noSurat: "", tanggalSurat: "", tujuan: "", perihal: "",
    lampiran: "", sifat: "Biasa", status: "Draft", keterangan: "", kategoriId: "", isiSurat: "",
    tempatTtd: "Jakarta", jabatanTtd: "", namaTtd: "", nipTtd: "", tembusan: "",
  });
  const [formDataDisposisi, setFormDataDisposisi] = useState({
    suratMasukId: "", tujuan: "", instruksi: "", prioritas: "Normal", tenggatWaktu: "", catatan: "",
  });
  const [formDataArsip, setFormDataArsip] = useState({
    suratMasukId: "", suratKeluarId: "", jenis: "Masuk", keterangan: "", lokasi: "",
    fileUrl: "", fileName: "", fileSize: 0, fileType: "",
  });
  const [formDataUser, setFormDataUser] = useState({
    email: "", password: "", name: "", role: "staff", jabatan: "", nip: "", phone: "",
  });
  const [formDataTemplate, setFormDataTemplate] = useState({
    nama: "", kode: "", konten: "", kategoriId: "", isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editorKey, setEditorKey] = useState(0); // For forcing editor re-render

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch functions
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchSuratMasuk = useCallback(async () => {
    try {
      const res = await fetch("/api/surat-masuk");
      if (res.ok) setSuratMasuk(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchSuratKeluar = useCallback(async () => {
    try {
      const res = await fetch("/api/surat-keluar");
      if (res.ok) setSuratKeluar(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchKategori = useCallback(async () => {
    try {
      const res = await fetch("/api/kategori");
      if (res.ok) setKategori(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchDisposisi = useCallback(async () => {
    try {
      const res = await fetch("/api/disposisi");
      if (res.ok) setDisposisi(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchArsip = useCallback(async () => {
    try {
      const res = await fetch("/api/arsip");
      if (res.ok) setArsip(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/template");
      if (res.ok) setTemplates(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchLaporanStatistik = useCallback(async () => {
    try {
      const res = await fetch("/api/laporan/statistik");
      if (res.ok) setLaporanStatistik(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchSuratMasuk();
      fetchSuratKeluar();
      fetchKategori();
      if (user.role === "admin") {
        fetchUsers();
      }
      fetchDisposisi();
      fetchArsip();
      fetchTemplates();
      fetchLaporanStatistik();
    }
  }, [user, fetchStats, fetchSuratMasuk, fetchSuratKeluar, fetchKategori, fetchUsers, fetchDisposisi, fetchArsip, fetchTemplates, fetchLaporanStatistik]);

  // Auth handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        toast.success("Login berhasil!");
      } else {
        const error = await res.json();
        toast.error(error.error || "Login gagal");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      toast.success("Berhasil logout");
    } catch {
      toast.error("Gagal logout");
    }
  };

  // CRUD Handlers - Surat Masuk
  const handleSaveMasuk = async () => {
    if (!formDataMasuk.noSurat || !formDataMasuk.tanggalSurat || !formDataMasuk.pengirim || !formDataMasuk.perihal) {
      toast.error("Harap lengkapi semua field yang wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const url = editingMasuk ? `/api/surat-masuk/${editingMasuk.id}` : "/api/surat-masuk";
      const method = editingMasuk ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formDataMasuk, kategoriId: formDataMasuk.kategoriId || null }),
      });
      if (res.ok) {
        toast.success(editingMasuk ? "Surat masuk berhasil diperbarui" : "Surat masuk berhasil ditambahkan");
        setShowMasukModal(false);
        resetFormMasuk();
        fetchSuratMasuk();
        fetchStats();
      } else {
        const error = await res.json();
        toast.error(error.error || "Terjadi kesalahan");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMasuk = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/surat-masuk/${deletingId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Surat masuk berhasil dihapus");
        setShowDeleteDialog(false);
        setDeletingId(null);
        setDeletingType(null);
        fetchSuratMasuk();
        fetchStats();
      } else {
        toast.error("Gagal menghapus surat masuk");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // CRUD Handlers - Surat Keluar
  const handleSaveKeluar = async () => {
    if (!formDataKeluar.noSurat || !formDataKeluar.tanggalSurat || !formDataKeluar.tujuan || !formDataKeluar.perihal) {
      toast.error("Harap lengkapi semua field yang wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const url = editingKeluar ? `/api/surat-keluar/${editingKeluar.id}` : "/api/surat-keluar";
      const method = editingKeluar ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formDataKeluar, kategoriId: formDataKeluar.kategoriId || null }),
      });
      if (res.ok) {
        toast.success(editingKeluar ? "Surat keluar berhasil diperbarui" : "Surat keluar berhasil ditambahkan");
        setShowKeluarModal(false);
        resetFormKeluar();
        fetchSuratKeluar();
        fetchStats();
      } else {
        const error = await res.json();
        toast.error(error.error || "Terjadi kesalahan");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKeluar = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/surat-keluar/${deletingId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Surat keluar berhasil dihapus");
        setShowDeleteDialog(false);
        setDeletingId(null);
        setDeletingType(null);
        fetchSuratKeluar();
        fetchStats();
      } else {
        toast.error("Gagal menghapus surat keluar");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // CRUD Handlers - User
  const handleSaveUser = async () => {
    if (!formDataUser.email || !formDataUser.name || (!editingUser && !formDataUser.password)) {
      toast.error("Harap lengkapi field yang wajib");
      return;
    }
    setLoading(true);
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";
      const body = editingUser 
        ? { ...formDataUser, password: formDataUser.password || undefined }
        : formDataUser;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingUser ? "User berhasil diperbarui" : "User berhasil ditambahkan");
        setShowUserModal(false);
        resetFormUser();
        fetchUsers();
      } else {
        const error = await res.json();
        toast.error(error.error || "Terjadi kesalahan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${deletingId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User berhasil dihapus");
        setShowDeleteDialog(false);
        setDeletingId(null);
        fetchUsers();
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal menghapus user");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Disposisi Handler
  const handleSaveDisposisi = async () => {
    if (!formDataDisposisi.suratMasukId || !formDataDisposisi.tujuan || !formDataDisposisi.instruksi) {
      toast.error("Harap lengkapi field yang wajib");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/disposisi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formDataDisposisi,
          dariUserId: user?.id,
          tenggatWaktu: formDataDisposisi.tenggatWaktu || null,
        }),
      });
      if (res.ok) {
        toast.success("Disposisi berhasil ditambahkan");
        setShowDisposisiModal(false);
        resetFormDisposisi();
        fetchDisposisi();
        fetchSuratMasuk();
      } else {
        const error = await res.json();
        toast.error(error.error || "Terjadi kesalahan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Arsip Handler
  const handleSaveArsip = async () => {
    if ((formDataArsip.jenis === "Masuk" && !formDataArsip.suratMasukId) ||
        (formDataArsip.jenis === "Keluar" && !formDataArsip.suratKeluarId)) {
      toast.error("Harap pilih surat yang akan diarsipkan");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/arsip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formDataArsip,
          suratMasukId: formDataArsip.jenis === "Masuk" ? formDataArsip.suratMasukId : null,
          suratKeluarId: formDataArsip.jenis === "Keluar" ? formDataArsip.suratKeluarId : null,
        }),
      });
      if (res.ok) {
        toast.success("Surat berhasil diarsipkan");
        setShowArsipModal(false);
        resetFormArsip();
        fetchArsip();
        fetchSuratMasuk();
        fetchSuratKeluar();
      } else {
        const error = await res.json();
        toast.error(error.error || "Terjadi kesalahan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Template Handler
  const handleSaveTemplate = async () => {
    if (!formDataTemplate.nama || !formDataTemplate.kode || !formDataTemplate.konten) {
      toast.error("Harap lengkapi field yang wajib");
      return;
    }
    setLoading(true);
    try {
      const url = editingTemplate ? `/api/template/${editingTemplate.id}` : "/api/template";
      const method = editingTemplate ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formDataTemplate, kategoriId: formDataTemplate.kategoriId || null }),
      });
      if (res.ok) {
        toast.success(editingTemplate ? "Template berhasil diperbarui" : "Template berhasil ditambahkan");
        setShowTemplateModal(false);
        resetFormTemplate();
        fetchTemplates();
      } else {
        const error = await res.json();
        toast.error(error.error || "Terjadi kesalahan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/template/${deletingId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Template berhasil dihapus");
        setShowDeleteDialog(false);
        setDeletingId(null);
        fetchTemplates();
      } else {
        toast.error("Gagal menghapus template");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Reset forms
  const resetFormMasuk = () => {
    setFormDataMasuk({ noSurat: "", tanggalSurat: new Date().toISOString().split("T")[0], pengirim: "", perihal: "", lampiran: "", sifat: "Biasa", status: "Baru", keterangan: "", kategoriId: "", fileUrl: "", fileName: "", fileSize: 0, fileType: "" });
    setEditingMasuk(null);
  };

  const resetFormKeluar = () => {
    setFormDataKeluar({ 
      noSurat: "", tanggalSurat: new Date().toISOString().split("T")[0], tujuan: "", perihal: "", 
      lampiran: "", sifat: "Biasa", status: "Draft", keterangan: "", kategoriId: "", isiSurat: "",
      tempatTtd: "Jakarta", jabatanTtd: "", namaTtd: "", nipTtd: "", tembusan: "",
    });
    setEditingKeluar(null);
    setEditorKey(prev => prev + 1); // Reset editor
  };

  const resetFormUser = () => {
    setFormDataUser({ email: "", password: "", name: "", role: "staff", jabatan: "", nip: "", phone: "" });
    setEditingUser(null);
  };

  const resetFormDisposisi = () => {
    setFormDataDisposisi({ suratMasukId: "", tujuan: "", instruksi: "", prioritas: "Normal", tenggatWaktu: "", catatan: "" });
  };

  const resetFormArsip = () => {
    setFormDataArsip({ suratMasukId: "", suratKeluarId: "", jenis: "Masuk", keterangan: "", lokasi: "", fileUrl: "", fileName: "", fileSize: 0, fileType: "" });
  };

  const resetFormTemplate = () => {
    setFormDataTemplate({ nama: "", kode: "", konten: "", kategoriId: "", isActive: true });
    setEditingTemplate(null);
  };

  // File upload handler
  const handleFileUpload = async (file: File, folder: string): Promise<{ url: string; name: string; size: number; type: string } | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // ini yg di ganti
      const handleFileUpload = async (
  file: File,
  folder: string
): Promise<{ url: string; name: string; size: number; type: string } | null> => {

  setUploading(true);

  try {

    const filePath = `${folder}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("dokumen")
      .upload(filePath, file);

    if (error) {
      toast.error(error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("dokumen")
      .getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    };

  } catch {
    toast.error("Gagal upload file");
    return null;
  } finally {
    setUploading(false);
  }
  };

      });

      if (res.ok) {
        const data = await res.json();
        return {
          url: data.file.url,
          name: data.file.name,
          size: data.file.size,
          type: data.file.type,
        };
      } else {
        const error = await res.json();
        toast.error(error.error || 'Gagal mengunggah file');
        return null;
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengunggah file');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Edit handlers
  const handleEditMasuk = (surat: SuratMasuk) => {
    setEditingMasuk(surat);
    setFormDataMasuk({
      noSurat: surat.noSurat,
      tanggalSurat: new Date(surat.tanggalSurat).toISOString().split("T")[0],
      pengirim: surat.pengirim,
      perihal: surat.perihal,
      lampiran: surat.lampiran || "",
      sifat: surat.sifat,
      status: surat.status,
      keterangan: surat.keterangan || "",
      kategoriId: surat.kategoriId || "",
      fileUrl: surat.fileUrl || "",
      fileName: surat.fileName || "",
      fileSize: surat.fileSize || 0,
      fileType: surat.fileType || "",
    });
    setShowMasukModal(true);
  };

  const handleEditKeluar = (surat: SuratKeluar) => {
    setEditingKeluar(surat);
    setFormDataKeluar({
      noSurat: surat.noSurat,
      tanggalSurat: new Date(surat.tanggalSurat).toISOString().split("T")[0],
      tujuan: surat.tujuan,
      perihal: surat.perihal,
      lampiran: surat.lampiran || "",
      sifat: surat.sifat,
      status: surat.status,
      keterangan: surat.keterangan || "",
      kategoriId: surat.kategoriId || "",
      isiSurat: surat.isiSurat || "",
      tempatTtd: surat.tempatTtd || "Jakarta",
      jabatanTtd: surat.jabatanTtd || "",
      namaTtd: surat.namaTtd || "",
      nipTtd: surat.nipTtd || "",
      tembusan: surat.tembusan || "",
    });
    setEditorKey(prev => prev + 1); // Reset editor for edit
    setShowKeluarModal(true);
  };

  const handleEditUser = (u: User) => {
    setEditingUser(u);
    setFormDataUser({
      email: u.email, password: "", name: u.name, role: u.role,
      jabatan: u.jabatan || "", nip: u.nip || "", phone: u.phone || "",
    });
    setShowUserModal(true);
  };

  const handleEditTemplate = (t: Template) => {
    setEditingTemplate(t);
    setFormDataTemplate({
      nama: t.nama, kode: t.kode, konten: t.konten,
      kategoriId: t.kategoriId || "", isActive: t.isActive,
    });
    setShowTemplateModal(true);
  };

  // Delete confirmation
  const confirmDelete = (id: string, type: string) => {
    setDeletingId(id);
    setDeletingType(type);
    setShowDeleteDialog(true);
  };

  // Filtered data
  const filteredMasuk = suratMasuk.filter((s) => {
    const matchSearch = s.noSurat.toLowerCase().includes(searchMasuk.toLowerCase()) ||
      s.pengirim.toLowerCase().includes(searchMasuk.toLowerCase()) ||
      s.perihal.toLowerCase().includes(searchMasuk.toLowerCase());
    const matchStatus = filterStatusMasuk === "all" || s.status === filterStatusMasuk;
    return matchSearch && matchStatus;
  });

  const filteredKeluar = suratKeluar.filter((s) => {
    const matchSearch = s.noSurat.toLowerCase().includes(searchKeluar.toLowerCase()) ||
      s.tujuan.toLowerCase().includes(searchKeluar.toLowerCase()) ||
      s.perihal.toLowerCase().includes(searchKeluar.toLowerCase());
    const matchStatus = filterStatusKeluar === "all" || s.status === filterStatusKeluar;
    return matchSearch && matchStatus;
  });

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  // Handle delete based on type
  const handleDelete = async () => {
    if (deletingType === "masuk") await handleDeleteMasuk();
    else if (deletingType === "keluar") await handleDeleteKeluar();
    else if (deletingType === "user") await handleDeleteUser();
    else if (deletingType === "template") await handleDeleteTemplate();
  };

  // Open disposisi modal for specific surat
  const openDisposisiModal = (surat: SuratMasuk) => {
    setFormDataDisposisi({ ...formDataDisposisi, suratMasukId: surat.id });
    setShowDisposisiModal(true);
  };

  // Apply template to surat keluar
  const applyTemplate = (template: Template) => {
    setFormDataKeluar({
      ...formDataKeluar,
      isiSurat: template.konten,
      kategoriId: template.kategoriId || "",
    });
    setShowKeluarModal(true);
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl w-16 h-16 mx-auto mb-4 shadow-lg">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              SINTAS
            </CardTitle>
            <CardDescription>Sistem Integrasi Administrasi Surat</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@sintas.go.id"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Masuk...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Masuk
                  </>
                )}
              </Button>
            </form>
            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
              <p className="font-medium mb-1">Demo Login:</p>
              <p>Email: admin@sintas.go.id</p>
              <p>Password: admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar with Autohide */}
      <aside 
        className={`${sidebarHovered ? "w-64" : "w-20"} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out fixed h-full z-30 shadow-sm`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow shrink-0">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${sidebarHovered ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent whitespace-nowrap">SINTAS</h1>
              <p className="text-xs text-slate-500 whitespace-nowrap">Admin Surat</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "masuk", icon: Mail, label: "Surat Masuk" },
            { id: "keluar", icon: Send, label: "Surat Keluar" },
            { id: "disposisi", icon: ChevronRight, label: "Disposisi" },
            { id: "arsip", icon: Archive, label: "Arsip" },
            { id: "template", icon: FileEdit, label: "Template Surat" },
            { id: "laporan", icon: BarChart3, label: "Laporan" },
            ...(user.role === "admin" ? [{ id: "users", icon: Users, label: "Manajemen User" }] : []),
          ].map((menu) => (
            <button
              key={menu.id}
              onClick={() => setActiveMenu(menu.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeMenu === menu.id
                  ? "bg-emerald-50 text-emerald-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
              title={!sidebarHovered ? menu.label : undefined}
            >
              <menu.icon className="h-5 w-5 shrink-0" />
              <span className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${sidebarHovered ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
                {menu.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-slate-100 p-2 rounded-full shrink-0">
              <UserIcon className="h-5 w-5 text-slate-600" />
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out overflow-hidden ${sidebarHovered ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
              <p className="font-medium text-sm truncate whitespace-nowrap">{user.name}</p>
              <p className="text-xs text-slate-500 truncate whitespace-nowrap">{user.jabatan || user.role}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ml-2 ${sidebarHovered ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
              Logout
            </span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarHovered ? "ml-64" : "ml-20"} transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {activeMenu === "dashboard" && "Dashboard"}
                {activeMenu === "masuk" && "Surat Masuk"}
                {activeMenu === "keluar" && "Surat Keluar"}
                {activeMenu === "disposisi" && "Disposisi Surat"}
                {activeMenu === "arsip" && "Arsip Surat"}
                {activeMenu === "template" && "Template Surat"}
                {activeMenu === "laporan" && "Laporan & Statistik"}
                {activeMenu === "users" && "Manajemen User"}
              </h2>
              <p className="text-sm text-slate-500">
                {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Dashboard */}
          {activeMenu === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Total Surat Masuk</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalMasuk}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Total Surat Keluar</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalKeluar}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-xl">
                        <Send className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Surat Baru</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.baruMasuk}</p>
                      </div>
                      <div className="bg-amber-100 p-3 rounded-xl">
                        <MailOpen className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Sedang Diproses</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.proses}</p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-xl">
                        <Clock className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts & Recent */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-500" />
                      Surat Masuk Terbaru
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-80">
                      {suratMasuk.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">Belum ada surat masuk</div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {suratMasuk.slice(0, 5).map((surat) => (
                            <div key={surat.id} className="p-4 hover:bg-slate-50 transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-800 truncate">{surat.perihal}</p>
                                  <p className="text-sm text-slate-500 mt-1">{surat.pengirim}</p>
                                </div>
                                <Badge className={`${statusColors[surat.status]} text-white shrink-0`}>{surat.status}</Badge>
                              </div>
                              <p className="text-xs text-slate-400 mt-2">{formatDate(surat.tanggalTerima)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Send className="h-5 w-5 text-green-500" />
                      Surat Keluar Terbaru
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-80">
                      {suratKeluar.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">Belum ada surat keluar</div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {suratKeluar.slice(0, 5).map((surat) => (
                            <div key={surat.id} className="p-4 hover:bg-slate-50 transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-800 truncate">{surat.perihal}</p>
                                  <p className="text-sm text-slate-500 mt-1">Kepada: {surat.tujuan}</p>
                                </div>
                                <Badge className={`${statusColors[surat.status]} text-white shrink-0`}>{surat.status}</Badge>
                              </div>
                              <p className="text-xs text-slate-400 mt-2">{formatDate(surat.tanggalSurat)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Surat Masuk */}
          {activeMenu === "masuk" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Cari nomor surat, pengirim, perihal..." value={searchMasuk} onChange={(e) => setSearchMasuk(e.target.value)} className="pl-10" />
                  </div>
                  <Select value={filterStatusMasuk} onValueChange={setFilterStatusMasuk}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="Baru">Baru</SelectItem>
                      <SelectItem value="Diproses">Diproses</SelectItem>
                      <SelectItem value="Selesai">Selesai</SelectItem>
                      <SelectItem value="Diarsipkan">Diarsipkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => { resetFormMasuk(); setShowMasukModal(true); }} className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" /> Tambah Surat Masuk
                </Button>
              </div>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[calc(100vh-320px)]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="font-semibold">No. Surat</TableHead>
                          <TableHead className="font-semibold">Tanggal</TableHead>
                          <TableHead className="font-semibold">Pengirim</TableHead>
                          <TableHead className="font-semibold">Perihal</TableHead>
                          <TableHead className="font-semibold">Sifat</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">File</TableHead>
                          <TableHead className="font-semibold text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMasuk.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-slate-500">Tidak ada data surat masuk</TableCell>
                          </TableRow>
                        ) : (
                          filteredMasuk.map((surat) => (
                            <TableRow key={surat.id} className="hover:bg-slate-50">
                              <TableCell className="font-medium">{surat.noSurat}</TableCell>
                              <TableCell>{formatDate(surat.tanggalSurat)}</TableCell>
                              <TableCell>{surat.pengirim}</TableCell>
                              <TableCell className="max-w-xs truncate">{surat.perihal}</TableCell>
                              <TableCell>
                                <Badge className={sifatColors[surat.sifat]} variant="secondary">{surat.sifat}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${statusColors[surat.status]} text-white`}>{surat.status}</Badge>
                              </TableCell>
                              <TableCell>
                                {surat.fileUrl ? (
                                  <a
                                    href={surat.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    <Paperclip className="h-4 w-4" />
                                    <span className="hidden sm:inline truncate max-w-[80px]">{surat.fileName}</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-400 text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-1">
                                  <Button size="icon" variant="ghost" onClick={() => { setSelectedSuratMasuk(surat); setShowDetailModal(true); }} className="hover:bg-slate-100">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => openDisposisiModal(surat)} className="hover:bg-blue-100 hover:text-blue-600" title="Disposisi">
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleEditMasuk(surat)} className="hover:bg-blue-100 hover:text-blue-600">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => confirmDelete(surat.id, "masuk")} className="hover:bg-red-100 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Surat Keluar */}
          {activeMenu === "keluar" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Cari nomor surat, tujuan, perihal..." value={searchKeluar} onChange={(e) => setSearchKeluar(e.target.value)} className="pl-10" />
                  </div>
                  <Select value={filterStatusKeluar} onValueChange={setFilterStatusKeluar}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Dikirim">Dikirim</SelectItem>
                      <SelectItem value="Diarsipkan">Diarsipkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => { resetFormKeluar(); setShowKeluarModal(true); }} className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" /> Tambah Surat Keluar
                </Button>
              </div>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[calc(100vh-320px)]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                          <TableHead className="font-semibold">No. Surat</TableHead>
                          <TableHead className="font-semibold">Tanggal</TableHead>
                          <TableHead className="font-semibold">Tujuan</TableHead>
                          <TableHead className="font-semibold">Perihal</TableHead>
                          <TableHead className="font-semibold">Sifat</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredKeluar.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">Tidak ada data surat keluar</TableCell>
                          </TableRow>
                        ) : (
                          filteredKeluar.map((surat) => (
                            <TableRow key={surat.id} className="hover:bg-slate-50">
                              <TableCell className="font-medium">{surat.noSurat}</TableCell>
                              <TableCell>{formatDate(surat.tanggalSurat)}</TableCell>
                              <TableCell>{surat.tujuan}</TableCell>
                              <TableCell className="max-w-xs truncate">{surat.perihal}</TableCell>
                              <TableCell>
                                <Badge className={sifatColors[surat.sifat]} variant="secondary">{surat.sifat}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${statusColors[surat.status]} text-white`}>{surat.status}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-1">
                                  <Button size="icon" variant="ghost" onClick={() => { setPreviewSurat(surat); setShowPreviewModal(true); }} className="hover:bg-green-100 hover:text-green-600" title="Preview & Print">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleEditKeluar(surat)} className="hover:bg-blue-100 hover:text-blue-600">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => confirmDelete(surat.id, "keluar")} className="hover:bg-red-100 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Disposisi */}
          {activeMenu === "disposisi" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Daftar Disposisi</h3>
                <Button onClick={() => { resetFormDisposisi(); setShowDisposisiModal(true); }} className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="h-4 w-4 mr-2" /> Tambah Disposisi
                </Button>
              </div>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[calc(100vh-320px)]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold">No. Surat</TableHead>
                          <TableHead className="font-semibold">Tujuan</TableHead>
                          <TableHead className="font-semibold">Instruksi</TableHead>
                          <TableHead className="font-semibold">Prioritas</TableHead>
                          <TableHead className="font-semibold">Tenggat</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {disposisi.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">Tidak ada data disposisi</TableCell>
                          </TableRow>
                        ) : (
                          disposisi.map((d) => (
                            <TableRow key={d.id} className="hover:bg-slate-50">
                              <TableCell className="font-medium">{suratMasuk.find(s => s.id === d.suratMasukId)?.noSurat || "-"}</TableCell>
                              <TableCell>{d.tujuan}</TableCell>
                              <TableCell className="max-w-xs truncate">{d.instruksi}</TableCell>
                              <TableCell>
                                <Badge className={prioritasColors[d.prioritas]} variant="secondary">{d.prioritas}</Badge>
                              </TableCell>
                              <TableCell>{d.tenggatWaktu ? formatDate(d.tenggatWaktu) : "-"}</TableCell>
                              <TableCell>
                                <Badge className={`${statusColors[d.status]} text-white`}>{d.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Arsip */}
          {activeMenu === "arsip" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Daftar Arsip</h3>
                <Button onClick={() => { resetFormArsip(); setShowArsipModal(true); }} className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="h-4 w-4 mr-2" /> Tambah ke Arsip
                </Button>
              </div>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[calc(100vh-320px)]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold">No. Arsip</TableHead>
                          <TableHead className="font-semibold">Jenis</TableHead>
                          <TableHead className="font-semibold">No. Surat</TableHead>
                          <TableHead className="font-semibold">Tanggal Arsip</TableHead>
                          <TableHead className="font-semibold">Lokasi</TableHead>
                          <TableHead className="font-semibold">File</TableHead>
                          <TableHead className="font-semibold">Keterangan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {arsip.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">Tidak ada data arsip</TableCell>
                          </TableRow>
                        ) : (
                          arsip.map((a) => (
                            <TableRow key={a.id} className="hover:bg-slate-50">
                              <TableCell className="font-medium">{a.noArsip}</TableCell>
                              <TableCell>
                                <Badge variant={a.jenis === "Masuk" ? "default" : "secondary"}>{a.jenis}</Badge>
                              </TableCell>
                              <TableCell>{a.suratMasuk?.noSurat || a.suratKeluar?.noSurat || "-"}</TableCell>
                              <TableCell>{formatDate(a.tanggalArsip)}</TableCell>
                              <TableCell>{a.lokasi || "-"}</TableCell>
                              <TableCell>
                                {a.fileUrl ? (
                                  <a
                                    href={a.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    <Paperclip className="h-4 w-4" />
                                    <span className="hidden sm:inline truncate max-w-[80px]">{a.fileName}</span>
                                  </a>
                                ) : (
                                  <span className="text-slate-400 text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">{a.keterangan || "-"}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Template */}
          {activeMenu === "template" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Template Surat Resmi</h3>
                <Button onClick={() => { resetFormTemplate(); setShowTemplateModal(true); }} className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="h-4 w-4 mr-2" /> Tambah Template
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((t) => (
                  <Card key={t.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{t.nama}</CardTitle>
                          <CardDescription>{t.kode}</CardDescription>
                        </div>
                        {t.isActive && <Badge className="bg-green-100 text-green-700">Aktif</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                        {t.kategori?.nama || "Tanpa Kategori"}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => applyTemplate(t)} className="flex-1">
                          <FileEdit className="h-4 w-4 mr-1" /> Gunakan
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEditTemplate(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => confirmDelete(t.id, "template")} className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Laporan */}
          {activeMenu === "laporan" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold">Laporan & Statistik</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={fetchLaporanStatistik}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={async () => {
                      try {
                        toast.info("Mengekspor data...");
                        const res = await fetch("/api/laporan/export?type=all");
                        if (res.ok) {
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `Laporan_SINTAS_${new Date().toISOString().split("T")[0]}.xlsx`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          toast.success("Data berhasil diekspor ke Excel");
                        } else {
                          toast.error("Gagal mengekspor data");
                        }
                      } catch {
                        toast.error("Terjadi kesalahan saat mengekspor");
                      }
                    }}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" /> Export Excel
                  </Button>
                </div>
              </div>

              {laporanStatistik ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-5 w-5 text-blue-600" />
                          <p className="text-sm text-blue-700">Surat Masuk</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-800">{laporanStatistik.totalMasuk}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-green-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Send className="h-5 w-5 text-green-600" />
                          <p className="text-sm text-green-700">Surat Keluar</p>
                        </div>
                        <p className="text-2xl font-bold text-green-800">{laporanStatistik.totalKeluar}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ChevronRight className="h-5 w-5 text-purple-600" />
                          <p className="text-sm text-purple-700">Disposisi</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-800">{laporanStatistik.totalDisposisi}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200 bg-gradient-to-br from-amber-50 to-amber-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Archive className="h-5 w-5 text-amber-600" />
                          <p className="text-sm text-amber-700">Arsip</p>
                        </div>
                        <p className="text-2xl font-bold text-amber-800">{laporanStatistik.totalArsip}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200 bg-gradient-to-br from-cyan-50 to-cyan-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-5 w-5 text-cyan-600" />
                          <p className="text-sm text-cyan-700">Top Pengirim</p>
                        </div>
                        <p className="text-sm font-semibold text-cyan-800 truncate">{laporanStatistik.topPengirim[0]?.pengirim || "-"}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200 bg-gradient-to-br from-rose-50 to-rose-100">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Send className="h-5 w-5 text-rose-600" />
                          <p className="text-sm text-rose-700">Top Tujuan</p>
                        </div>
                        <p className="text-sm font-semibold text-rose-800 truncate">{laporanStatistik.topTujuan[0]?.tujuan || "-"}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Per Bulan Chart */}
                  <Card className="border-slate-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-slate-600" />
                        Statistik Surat Per Bulan
                      </CardTitle>
                      <CardDescription>Jumlah surat masuk dan keluar per bulan tahun ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-72">
                        <div className="space-y-2 pr-4">
                          {laporanStatistik.perBulan.map((b) => {
                            const maxVal = Math.max(b.masuk, b.keluar, 1);
                            return (
                              <div key={b.bulan} className="flex items-center gap-3 py-1">
                                <span className="w-20 text-sm font-medium text-slate-600">{b.bulan}</span>
                                <div className="flex-1 flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 text-xs text-blue-600">{b.masuk}</div>
                                    <div className="flex-1 bg-blue-100 rounded-full h-4 overflow-hidden">
                                      <div 
                                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(b.masuk / maxVal) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 text-xs text-green-600">{b.keluar}</div>
                                    <div className="flex-1 bg-green-100 rounded-full h-4 overflow-hidden">
                                      <div 
                                        className="bg-green-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(b.keluar / maxVal) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      <div className="flex gap-6 mt-4 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          <span className="text-sm text-slate-600">Surat Masuk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span className="text-sm text-slate-600">Surat Keluar</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Grid Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Per Kategori */}
                    <Card className="border-slate-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Per Kategori</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {laporanStatistik.perKategori.length > 0 ? (
                            laporanStatistik.perKategori.slice(0, 5).map((k) => (
                              <div key={k.kategori} className="flex justify-between items-center">
                                <span className="text-sm text-slate-600 truncate flex-1">{k.kategori}</span>
                                <Badge variant="secondary" className="ml-2">{k.jumlah}</Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400">Belum ada data</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Per Status */}
                    <Card className="border-slate-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Per Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.keys(laporanStatistik.perStatus).length > 0 ? (
                            Object.entries(laporanStatistik.perStatus).map(([status, count]) => (
                              <div key={status} className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">{status}</span>
                                <Badge className={`${statusColors[status] || "bg-gray-500"} text-white`}>{count}</Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400">Belum ada data</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Per Sifat */}
                    <Card className="border-slate-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Per Sifat Surat</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.keys(laporanStatistik.perSifat).length > 0 ? (
                            Object.entries(laporanStatistik.perSifat).map(([sifat, count]) => (
                              <div key={sifat} className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">{sifat}</span>
                                <Badge className={`${sifatColors[sifat] || "bg-gray-100 text-gray-800"}`}>{count}</Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400">Belum ada data</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Disposisi Per Prioritas */}
                    <Card className="border-slate-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Disposisi Per Prioritas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.keys(laporanStatistik.disposisiPerPrioritas).length > 0 ? (
                            Object.entries(laporanStatistik.disposisiPerPrioritas).map(([prioritas, count]) => (
                              <div key={prioritas} className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">{prioritas}</span>
                                <Badge className={`${prioritasColors[prioritas] || "bg-gray-100 text-gray-800"}`}>{count}</Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400">Belum ada data</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top 5 Lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-slate-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-500" />
                          Top 5 Pengirim Surat
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {laporanStatistik.topPengirim.length > 0 ? (
                            laporanStatistik.topPengirim.map((p, i) => (
                              <div key={p.pengirim} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  i === 0 ? "bg-amber-400 text-white" : 
                                  i === 1 ? "bg-slate-300 text-slate-700" :
                                  i === 2 ? "bg-orange-300 text-white" : 
                                  "bg-slate-100 text-slate-600"
                                }`}>
                                  {i + 1}
                                </div>
                                <span className="flex-1 text-sm text-slate-700 truncate">{p.pengirim}</span>
                                <Badge variant="outline">{p.jumlah} surat</Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400">Belum ada data</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Send className="h-4 w-4 text-green-500" />
                          Top 5 Tujuan Surat
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {laporanStatistik.topTujuan.length > 0 ? (
                            laporanStatistik.topTujuan.map((t, i) => (
                              <div key={t.tujuan} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  i === 0 ? "bg-amber-400 text-white" : 
                                  i === 1 ? "bg-slate-300 text-slate-700" :
                                  i === 2 ? "bg-orange-300 text-white" : 
                                  "bg-slate-100 text-slate-600"
                                }`}>
                                  {i + 1}
                                </div>
                                <span className="flex-1 text-sm text-slate-700 truncate">{t.tujuan}</span>
                                <Badge variant="outline">{t.jumlah} surat</Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400">Belum ada data</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Card className="border-slate-200">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">Memuat data statistik...</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={fetchLaporanStatistik}>
                        <RefreshCw className="h-4 w-4 mr-2" /> Muat Ulang
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Users Management */}
          {activeMenu === "users" && user.role === "admin" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manajemen User</h3>
                <Button onClick={() => { resetFormUser(); setShowUserModal(true); }} className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="h-4 w-4 mr-2" /> Tambah User
                </Button>
              </div>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[calc(100vh-320px)]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold">Nama</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Role</TableHead>
                          <TableHead className="font-semibold">Jabatan</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">Tidak ada data user</TableCell>
                          </TableRow>
                        ) : (
                          users.map((u) => (
                            <TableRow key={u.id} className="hover:bg-slate-50">
                              <TableCell className="font-medium">{u.name}</TableCell>
                              <TableCell>{u.email}</TableCell>
                              <TableCell>
                                <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                              </TableCell>
                              <TableCell>{u.jabatan || "-"}</TableCell>
                              <TableCell>
                                <Badge className={u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                  {u.isActive ? "Aktif" : "Nonaktif"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-1">
                                  <Button size="icon" variant="ghost" onClick={() => handleEditUser(u)} className="hover:bg-blue-100 hover:text-blue-600">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => confirmDelete(u.id, "user")} className="hover:bg-red-100 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {/* Surat Masuk Modal */}
      <Dialog open={showMasukModal} onOpenChange={setShowMasukModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              {editingMasuk ? "Edit Surat Masuk" : "Tambah Surat Masuk"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nomor Surat *</Label>
              <Input value={formDataMasuk.noSurat} onChange={(e) => setFormDataMasuk({ ...formDataMasuk, noSurat: e.target.value })} placeholder="001/ABC/I/2024" />
            </div>
            <div className="grid gap-2">
              <Label>Tanggal Surat *</Label>
              <Input type="date" value={formDataMasuk.tanggalSurat} onChange={(e) => setFormDataMasuk({ ...formDataMasuk, tanggalSurat: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Pengirim *</Label>
              <Input value={formDataMasuk.pengirim} onChange={(e) => setFormDataMasuk({ ...formDataMasuk, pengirim: e.target.value })} placeholder="Nama pengirim" />
            </div>
            <div className="grid gap-2">
              <Label>Perihal *</Label>
              <Textarea value={formDataMasuk.perihal} onChange={(e) => setFormDataMasuk({ ...formDataMasuk, perihal: e.target.value })} placeholder="Perihal surat" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Sifat</Label>
                <Select value={formDataMasuk.sifat} onValueChange={(v) => setFormDataMasuk({ ...formDataMasuk, sifat: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Biasa">Biasa</SelectItem>
                    <SelectItem value="Segera">Segera</SelectItem>
                    <SelectItem value="Sangat Segera">Sangat Segera</SelectItem>
                    <SelectItem value="Rahasia">Rahasia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={formDataMasuk.status} onValueChange={(v) => setFormDataMasuk({ ...formDataMasuk, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baru">Baru</SelectItem>
                    <SelectItem value="Diproses">Diproses</SelectItem>
                    <SelectItem value="Selesai">Selesai</SelectItem>
                    <SelectItem value="Diarsipkan">Diarsipkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Kategori</Label>
              <Select value={formDataMasuk.kategoriId} onValueChange={(v) => setFormDataMasuk({ ...formDataMasuk, kategoriId: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {kategori.map((k) => (
                    <SelectItem key={k.id} value={k.id}>{k.nama} ({k.kode})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Lampiran</Label>
              <Input value={formDataMasuk.lampiran} onChange={(e) => setFormDataMasuk({ ...formDataMasuk, lampiran: e.target.value })} placeholder="Jumlah lampiran" />
            </div>
            
            {/* File Upload */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Upload Dokumen
              </Label>
              {formDataMasuk.fileUrl ? (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{formDataMasuk.fileName}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(formDataMasuk.fileSize)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormDataMasuk({ ...formDataMasuk, fileUrl: "", fileName: "", fileSize: 0, fileType: "" })}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4">
                  <input
                    type="file"
                    id="fileMasuk"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const result = await handleFileUpload(file, "surat-masuk");
                        if (result) {
                          setFormDataMasuk({
                            ...formDataMasuk,
                            fileUrl: result.url,
                            fileName: result.name,
                            fileSize: result.size,
                            fileType: result.type,
                          });
                        }
                      }
                      e.target.value = "";
                    }}
                    disabled={uploading}
                  />
                  <label
                    htmlFor="fileMasuk"
                    className="flex flex-col items-center justify-center cursor-pointer py-4"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2" />
                    ) : (
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    )}
                    <span className="text-sm text-slate-500">
                      {uploading ? "Mengunggah..." : "Klik untuk upload file"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      PDF, Word, Excel, Gambar (maks 10MB)
                    </span>
                  </label>
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label>Keterangan</Label>
              <Textarea value={formDataMasuk.keterangan} onChange={(e) => setFormDataMasuk({ ...formDataMasuk, keterangan: e.target.value })} placeholder="Keterangan tambahan" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMasukModal(false)}>Batal</Button>
            <Button onClick={handleSaveMasuk} disabled={loading || uploading} className="bg-emerald-500 hover:bg-emerald-600">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Surat Keluar Modal */}
      <Dialog open={showKeluarModal} onOpenChange={setShowKeluarModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-500" />
              {editingKeluar ? "Edit Surat Keluar" : "Tambah Surat Keluar"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nomor Surat *</Label>
                <div className="flex gap-2">
                  <Input value={formDataKeluar.noSurat} onChange={(e) => setFormDataKeluar({ ...formDataKeluar, noSurat: e.target.value })} placeholder="001/OUT/I/2024" className="flex-1" />
                  <Button type="button" variant="outline" size="icon" onClick={async () => {
                    try {
                      const res = await fetch("/api/surat-keluar/generate-no");
                      if (res.ok) {
                        const data = await res.json();
                        setFormDataKeluar({ ...formDataKeluar, noSurat: data.noSurat });
                        toast.success("Nomor surat otomatis dibuat");
                      }
                    } catch {
                      toast.error("Gagal membuat nomor otomatis");
                    }
                  }} title="Generate otomatis">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Tanggal Surat *</Label>
                <Input type="date" value={formDataKeluar.tanggalSurat} onChange={(e) => setFormDataKeluar({ ...formDataKeluar, tanggalSurat: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Tujuan *</Label>
              <Input value={formDataKeluar.tujuan} onChange={(e) => setFormDataKeluar({ ...formDataKeluar, tujuan: e.target.value })} placeholder="Nama instansi/penerima" />
            </div>
            <div className="grid gap-2">
              <Label>Perihal *</Label>
              <Textarea value={formDataKeluar.perihal} onChange={(e) => setFormDataKeluar({ ...formDataKeluar, perihal: e.target.value })} placeholder="Perihal surat" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Sifat</Label>
                <Select value={formDataKeluar.sifat} onValueChange={(v) => setFormDataKeluar({ ...formDataKeluar, sifat: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Biasa">Biasa</SelectItem>
                    <SelectItem value="Segera">Segera</SelectItem>
                    <SelectItem value="Sangat Segera">Sangat Segera</SelectItem>
                    <SelectItem value="Rahasia">Rahasia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={formDataKeluar.status} onValueChange={(v) => setFormDataKeluar({ ...formDataKeluar, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Dikirim">Dikirim</SelectItem>
                    <SelectItem value="Diarsipkan">Diarsipkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Kategori</Label>
                <Select value={formDataKeluar.kategoriId} onValueChange={(v) => setFormDataKeluar({ ...formDataKeluar, kategoriId: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {kategori.map((k) => (
                      <SelectItem key={k.id} value={k.id}>{k.nama} ({k.kode})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <FileEdit className="h-4 w-4" />
                  Gunakan Template
                </Label>
                <Select 
                  value="" 
                  onValueChange={(v) => {
                    if (v && v !== "_none") {
                      const selectedTemplate = templates.find(t => t.id === v);
                      if (selectedTemplate) {
                        setFormDataKeluar({ 
                          ...formDataKeluar, 
                          isiSurat: selectedTemplate.konten,
                          kategoriId: selectedTemplate.kategoriId || formDataKeluar.kategoriId
                        });
                        setEditorKey(prev => prev + 1); // Force editor re-render
                        toast.success(`Template "${selectedTemplate.nama}" diterapkan`);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.filter(t => t.isActive).length === 0 ? (
                      <SelectItem value="_none" disabled>Tidak ada template aktif</SelectItem>
                    ) : (
                      templates.filter(t => t.isActive).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nama} ({t.kode})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Isi Surat</Label>
              <RichTextEditor
                key={editorKey}
                content={formDataKeluar.isiSurat || ""}
                onChange={(html) => setFormDataKeluar({ ...formDataKeluar, isiSurat: html })}
                placeholder="Ketik isi surat di sini, atau pilih template di atas..."
                className="min-h-[250px]"
              />
            </div>
            
            {/* Tanda Tangan Section */}
            <div className="border-t border-slate-200 pt-4 mt-2">
              <h4 className="font-medium text-sm text-slate-700 mb-3">Tanda Tangan & Tembusan</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tempat</Label>
                  <Input value={formDataKeluar.tempatTtd} onChange={(e) => setFormDataKeluar({ ...formDataKeluar, tempatTtd: e.target.value })} placeholder="Jakarta" />
                </div>
                <div className="grid gap-2">
                  <Label>Jabatan Penandatangan</Label>
                  <Input value={formDataKeluar.jabatanTtd} onChange={(e) => setFormDataKeluar({ ...formDataKeluar, jabatanTtd: e.target.value })} placeholder="Kepala Bagian Administrasi" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="grid gap-2">
                  <Label>Nama Penandatangan</Label>
                  <Input value={formDataKeluar.namaTtd} onChange={(e) => setFormDataKeluar({ ...formDataKeluar, namaTtd: e.target.value })} placeholder="Nama lengkap" />
                </div>
                <div className="grid gap-2">
                  <Label>NIP</Label>
                  <Input value={formDataKeluar.nipTtd} onChange={(e) => setFormDataKeluar({ ...formDataKeluar, nipTtd: e.target.value })} placeholder="19800101 200001 1 001" />
                </div>
              </div>
              <div className="grid gap-2 mt-3">
                <Label>Tembusan</Label>
                <Textarea 
                  value={formDataKeluar.tembusan} 
                  onChange={(e) => setFormDataKeluar({ ...formDataKeluar, tembusan: e.target.value })} 
                  placeholder="1. Sekretaris Jenderal&#10;2. Arsip" 
                  rows={2} 
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Keterangan</Label>
              <Textarea value={formDataKeluar.keterangan} onChange={(e) => setFormDataKeluar({ ...formDataKeluar, keterangan: e.target.value })} placeholder="Keterangan tambahan" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKeluarModal(false)}>Batal</Button>
            <Button onClick={handleSaveKeluar} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disposisi Modal */}
      <Dialog open={showDisposisiModal} onOpenChange={setShowDisposisiModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-purple-500" />
              Tambah Disposisi
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Surat Masuk</Label>
              <Select value={formDataDisposisi.suratMasukId} onValueChange={(v) => setFormDataDisposisi({ ...formDataDisposisi, suratMasukId: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih surat" /></SelectTrigger>
                <SelectContent>
                  {suratMasuk.filter(s => s.status !== "Diarsipkan").map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.noSurat} - {s.perihal.slice(0, 30)}...</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tujuan Disposisi *</Label>
              <Input value={formDataDisposisi.tujuan} onChange={(e) => setFormDataDisposisi({ ...formDataDisposisi, tujuan: e.target.value })} placeholder="Bagian/Personel tujuan" />
            </div>
            <div className="grid gap-2">
              <Label>Instruksi *</Label>
              <Textarea value={formDataDisposisi.instruksi} onChange={(e) => setFormDataDisposisi({ ...formDataDisposisi, instruksi: e.target.value })} placeholder="Instruksi disposisi" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Prioritas</Label>
                <Select value={formDataDisposisi.prioritas} onValueChange={(v) => setFormDataDisposisi({ ...formDataDisposisi, prioritas: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rendah">Rendah</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Tinggi">Tinggi</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Tenggat Waktu</Label>
                <Input type="date" value={formDataDisposisi.tenggatWaktu} onChange={(e) => setFormDataDisposisi({ ...formDataDisposisi, tenggatWaktu: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Catatan</Label>
              <Textarea value={formDataDisposisi.catatan} onChange={(e) => setFormDataDisposisi({ ...formDataDisposisi, catatan: e.target.value })} placeholder="Catatan tambahan" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisposisiModal(false)}>Batal</Button>
            <Button onClick={handleSaveDisposisi} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Arsip Modal */}
      <Dialog open={showArsipModal} onOpenChange={setShowArsipModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-amber-500" />
              Tambah ke Arsip
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Jenis Surat</Label>
              <Select value={formDataArsip.jenis} onValueChange={(v) => setFormDataArsip({ ...formDataArsip, jenis: v, suratMasukId: "", suratKeluarId: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masuk">Surat Masuk</SelectItem>
                  <SelectItem value="Keluar">Surat Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formDataArsip.jenis === "Masuk" ? (
              <div className="grid gap-2">
                <Label>Pilih Surat Masuk</Label>
                <Select value={formDataArsip.suratMasukId} onValueChange={(v) => setFormDataArsip({ ...formDataArsip, suratMasukId: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih surat" /></SelectTrigger>
                  <SelectContent>
                    {suratMasuk.filter(s => !s.arsip).map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.noSurat} - {s.perihal.slice(0, 30)}...</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>Pilih Surat Keluar</Label>
                <Select value={formDataArsip.suratKeluarId} onValueChange={(v) => setFormDataArsip({ ...formDataArsip, suratKeluarId: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih surat" /></SelectTrigger>
                  <SelectContent>
                    {suratKeluar.filter(s => !s.arsip).map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.noSurat} - {s.perihal.slice(0, 30)}...</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label>Lokasi Arsip</Label>
              <Input value={formDataArsip.lokasi} onChange={(e) => setFormDataArsip({ ...formDataArsip, lokasi: e.target.value })} placeholder="Contoh: Rak A-1" />
            </div>
            
            {/* File Upload */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Upload Dokumen Arsip
              </Label>
              {formDataArsip.fileUrl ? (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                  <FileText className="h-8 w-8 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{formDataArsip.fileName}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(formDataArsip.fileSize)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormDataArsip({ ...formDataArsip, fileUrl: "", fileName: "", fileSize: 0, fileType: "" })}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4">
                  <input
                    type="file"
                    id="fileArsip"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const result = await handleFileUpload(file, "arsip");
                        if (result) {
                          setFormDataArsip({
                            ...formDataArsip,
                            fileUrl: result.url,
                            fileName: result.name,
                            fileSize: result.size,
                            fileType: result.type,
                          });
                        }
                      }
                      e.target.value = "";
                    }}
                    disabled={uploading}
                  />
                  <label
                    htmlFor="fileArsip"
                    className="flex flex-col items-center justify-center cursor-pointer py-4"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-2" />
                    ) : (
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    )}
                    <span className="text-sm text-slate-500">
                      {uploading ? "Mengunggah..." : "Klik untuk upload file"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      PDF, Word, Excel, Gambar (maks 10MB)
                    </span>
                  </label>
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label>Keterangan</Label>
              <Textarea value={formDataArsip.keterangan} onChange={(e) => setFormDataArsip({ ...formDataArsip, keterangan: e.target.value })} placeholder="Keterangan arsip" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArsipModal(false)}>Batal</Button>
            <Button onClick={handleSaveArsip} disabled={loading || uploading} className="bg-emerald-500 hover:bg-emerald-600">
              {loading ? "Menyimpan..." : "Arsipkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              {editingUser ? "Edit User" : "Tambah User"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama *</Label>
              <Input value={formDataUser.name} onChange={(e) => setFormDataUser({ ...formDataUser, name: e.target.value })} placeholder="Nama lengkap" />
            </div>
            <div className="grid gap-2">
              <Label>Email *</Label>
              <Input type="email" value={formDataUser.email} onChange={(e) => setFormDataUser({ ...formDataUser, email: e.target.value })} placeholder="email@domain.com" />
            </div>
            <div className="grid gap-2">
              <Label>{editingUser ? "Password (kosongkan jika tidak diubah)" : "Password *"}</Label>
              <Input type="password" value={formDataUser.password} onChange={(e) => setFormDataUser({ ...formDataUser, password: e.target.value })} placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={formDataUser.role} onValueChange={(v) => setFormDataUser({ ...formDataUser, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="kepala">Kepala</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>NIP</Label>
                <Input value={formDataUser.nip} onChange={(e) => setFormDataUser({ ...formDataUser, nip: e.target.value })} placeholder="NIP" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Jabatan</Label>
              <Input value={formDataUser.jabatan} onChange={(e) => setFormDataUser({ ...formDataUser, jabatan: e.target.value })} placeholder="Jabatan" />
            </div>
            <div className="grid gap-2">
              <Label>Telepon</Label>
              <Input value={formDataUser.phone} onChange={(e) => setFormDataUser({ ...formDataUser, phone: e.target.value })} placeholder="Nomor telepon" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserModal(false)}>Batal</Button>
            <Button onClick={handleSaveUser} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-purple-500" />
              {editingTemplate ? "Edit Template" : "Tambah Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nama Template *</Label>
                <Input value={formDataTemplate.nama} onChange={(e) => setFormDataTemplate({ ...formDataTemplate, nama: e.target.value })} placeholder="Nama template" />
              </div>
              <div className="grid gap-2">
                <Label>Kode *</Label>
                <Input value={formDataTemplate.kode} onChange={(e) => setFormDataTemplate({ ...formDataTemplate, kode: e.target.value })} placeholder="TMPL-XX" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Kategori</Label>
              <Select value={formDataTemplate.kategoriId} onValueChange={(v) => setFormDataTemplate({ ...formDataTemplate, kategoriId: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {kategori.map((k) => (
                    <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Konten HTML *</Label>
              <Textarea value={formDataTemplate.konten} onChange={(e) => setFormDataTemplate({ ...formDataTemplate, konten: e.target.value })} placeholder="Konten template dalam HTML" rows={15} className="font-mono text-sm" />
            </div>
            <p className="text-xs text-slate-500">
              Gunakan placeholder: {"{{nomor_surat}}"}, {"{{tanggal}}"}, {"{{tujuan}}"}, {"{{perihal}}"}, {"{{isi_surat}}"}, {"{{nama_kepala}}"}, {"{{nip_kepala}}"}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>Batal</Button>
            <Button onClick={handleSaveTemplate} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Surat Masuk</DialogTitle>
          </DialogHeader>
          {selectedSuratMasuk && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">Nomor Surat</Label>
                  <p className="font-medium">{selectedSuratMasuk.noSurat}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Tanggal Surat</Label>
                  <p className="font-medium">{formatDate(selectedSuratMasuk.tanggalSurat)}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Pengirim</Label>
                  <p className="font-medium">{selectedSuratMasuk.pengirim}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Tanggal Terima</Label>
                  <p className="font-medium">{formatDate(selectedSuratMasuk.tanggalTerima)}</p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-slate-500">Perihal</Label>
                <p className="font-medium">{selectedSuratMasuk.perihal}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">Sifat</Label>
                  <p><Badge className={sifatColors[selectedSuratMasuk.sifat]} variant="secondary">{selectedSuratMasuk.sifat}</Badge></p>
                </div>
                <div>
                  <Label className="text-slate-500">Status</Label>
                  <p><Badge className={`${statusColors[selectedSuratMasuk.status]} text-white`}>{selectedSuratMasuk.status}</Badge></p>
                </div>
              </div>
              {selectedSuratMasuk.keterangan && (
                <div>
                  <Label className="text-slate-500">Keterangan</Label>
                  <p className="font-medium">{selectedSuratMasuk.keterangan}</p>
                </div>
              )}
              {selectedSuratMasuk.disposisi && selectedSuratMasuk.disposisi.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-slate-500 mb-2 block">Riwayat Disposisi</Label>
                    <div className="space-y-2">
                      {selectedSuratMasuk.disposisi.map((d) => (
                        <div key={d.id} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{d.tujuan}</p>
                              <p className="text-sm text-slate-600">{d.instruksi}</p>
                            </div>
                            <Badge className={`${statusColors[d.status]} text-white`}>{d.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Konfirmasi Hapus
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-red-500 hover:bg-red-600">
              {loading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Surat Preview Modal */}
      <SuratPreview
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        surat={previewSurat}
      />
    </div>
  );
}
