/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Leaf, 
  Search, 
  FileText, 
  ShieldAlert, 
  HelpCircle, 
  Bot, 
  Database, 
  Settings, 
  Volume2, 
  Sparkles,
  Accessibility,
  Eye,
  CheckCircle,
  TrendingUp,
  MapPin,
  Clock,
  Phone,
  Droplet,
  Mail,
  LayoutDashboard,
  LogOut,
  FolderOpen,
  Laptop,
  CheckCircle2,
  FolderSync,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { defaultServices, defaultSubmissions } from './data/defaultServices';
import { ServiceTemplate, Submission, SubmissionStatus, AccessibilitySettings, StatusTimelineStep, AppNotification } from './types';

// Component imports
import { AccessibilityWidget } from './components/AccessibilityWidget';
import { LayananKami } from './components/LayananKami';
import { FormCreator } from './components/FormCreator';
import { TrackingSobat } from './components/TrackingSobat';
import { AdminPanel } from './components/AdminPanel';
import { AsistenHijau } from './components/AsistenHijau';
import { EcoCarousel } from './components/EcoCarousel';
import { EnvironmentalMap } from './components/EnvironmentalMap';
import { PublicNotifications } from './components/PublicNotifications';

export default function App() {
  // ----------------------------------------------------
  // States with Local Persistence Setup
  // ----------------------------------------------------
  const [services, setServices] = useState<ServiceTemplate[]>(() => {
    const saved = localStorage.getItem('sh_services_v1');
    return saved ? JSON.parse(saved) : defaultServices;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('sh_submissions_v1');
    return saved ? JSON.parse(saved) : defaultSubmissions;
  });

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('sh_accessibility_v1');
    return saved ? JSON.parse(saved) : {
      textSize: 'normal',
      contrast: 'normal',
      dyslexiaFont: false,
      textToSpeech: false,
      screenReaderActive: false
    };
  });

  const [portal, setPortal] = useState<'guest' | 'admin'>('guest');
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [adminSubTab, setAdminSubTab] = useState<'kelola' | 'rancang'>('kelola');
  const [trackSearchCode, setTrackSearchCode] = useState<string>('');
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const [isMenuUtamaOpen, setIsMenuUtamaOpen] = useState(true);
  const [isPortalPublikOpen, setIsPortalPublikOpen] = useState(true);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState(false);
  const [adminActivityLogs, setAdminActivityLogs] = useState<Array<{ id: string, action: string, timestamp: string, iconType: string }>>([
    { id: 'log-1', action: 'Login berhasil sebagai Administrator DLH Pontianak', timestamp: '2026-06-03 12:44', iconType: 'success' },
    { id: 'log-2', action: 'Memverifikasi kelayakan teknis berkas PT. Pontianak Tirta Agung', timestamp: '2026-06-03 11:20', iconType: 'info' },
    { id: 'log-3', action: 'Menerbitkan rekomendasi kelayakan UKL-UPL Bapak Ahmad Subardjo', timestamp: '2026-06-03 09:12', iconType: 'success' },
    { id: 'log-4', action: 'Memperbarui koordinat sebaran TPS 3R di peta lingkungan', timestamp: '2026-06-02 16:30', iconType: 'info' },
    { id: 'log-5', action: 'Menambahkan kuesioner baru untuk layanan Pengujian Kebisingan', timestamp: '2026-06-02 14:15', iconType: 'success' },
  ]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // States to power newly implemented advanced features:
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);
  const [isCachedOffline, setIsCachedOffline] = useState(() => {
    return localStorage.getItem('sh_procedures_cached') === 'true';
  });
  const [cacheTime, setCacheTime] = useState(() => {
    return localStorage.getItem('sh_procedures_cache_time') || '';
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('sh_notifications_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Seed default notifications for rich, immediate visual gameplay
    return [
      {
        id: 'notif-1',
        submissionId: 'SH-2026-08123',
        applicantName: 'PT. Pontianak Tirta Agung',
        serviceName: 'Pengujian Sampah / Air / Udara Laboratorium',
        newStatus: 'SURVEY_TEKNIS',
        message: 'Status permohonan Laboratorium (SH-2026-08123) milik PT. Pontianak Tirta Agung diperbarui oleh Admin menjadi SURVEY TEKNIS.',
        timestamp: '2026-06-01 09:12',
        isRead: false
      },
      {
        id: 'notif-2',
        submissionId: 'SH-2026-04981',
        applicantName: 'Bapak Ahmad Subardjo',
        serviceName: 'Izin Rekomendasi Upaya Pemantauan Lingkungan Hidup (UKL-UPL)',
        newStatus: 'SELESAI',
        message: 'Selamat! Dokumen Kelayakan UKL-UPL (SH-2026-04981) atas nama Bapak Ahmad Subardjo telah SELESAI diterbitkan dan siap diunduh.',
        timestamp: '2026-06-02 07:45',
        isRead: false
      }
    ];
  });

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem('sh_notifications_v1', JSON.stringify(notifications));
  }, [notifications]);

  // Read URL query parameter for direct tracking link scan:
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackingCode = params.get('lacak') || params.get('tracking');
    if (trackingCode) {
      setPortal('guest');
      setActiveTab('lacak');
      setTrackSearchCode(trackingCode.toUpperCase());
      addToast(`Melacak otomatis berkas ${trackingCode.toUpperCase()} via scan QR!`, 'success');
      speakText(`Melacak otomatis dokumen ${trackingCode.toUpperCase()}`);
    }
  }, []);

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    addToast('Semua notifikasi ditandai telah dibaca.', 'success');
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    addToast('Semua riwayat notifikasi berhasil dibersihkan.', 'info');
  };

  const handleSelectNotification = (submissionId: string) => {
    setPortal('guest');
    setActiveTab('lacak');
    setTrackSearchCode(submissionId.toUpperCase());
  };

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleCacheOffline = () => {
    addToast('Menghubungkan & menyalin data prosedur perizinan...', 'info');
    setTimeout(() => {
      localStorage.setItem('sh_procedures_cached', 'true');
      const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      localStorage.setItem('sh_procedures_cache_time', nowStr);
      setIsCachedOffline(true);
      setCacheTime(nowStr);
      addToast('Prosedur perizinan & FAQ berhasil disimpan ke memori offline perangkat Anda!', 'success');
      speakText('Kanal prosedur perizinan sukses tersimpan secara offline.');
    }, 800);
  };

  // Ref for the admin sidebar navigation container
  const adminSidebarNavRef = useRef<HTMLElement | null>(null);
  // Ref for the sidebar search input
  const sidebarSearchInputRef = useRef<HTMLInputElement | null>(null);

  // Global Keyboard Shortcuts (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (portal === 'admin') {
          setIsAdminSidebarOpen(true);
          setTimeout(() => {
            if (sidebarSearchInputRef.current) {
              sidebarSearchInputRef.current.focus();
              sidebarSearchInputRef.current.select();
            }
          }, 50);
          addToast('Fokus pencarian menu sidebar admin (Ctrl+K)', 'info');
          speakText('Pencarian menu aktif');
        } else {
          addToast('Shortcut Ctrl+K aktif. Silakan masuk ke Panel Admin dahulu untuk mencari menu.', 'info');
          speakText('Shortcut cari menu aktif di panel admin');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [portal]);

  // Auto-scroll to active sub-tab inside admin navigation when it changes
  useEffect(() => {
    if (portal === 'admin' && adminSidebarNavRef.current) {
      const activeEl = adminSidebarNavRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [adminSubTab, portal]);

  // Keyboard accessibility handler for admin sidebar buttons using Arrow keys
  const handleSidebarKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const nav = adminSidebarNavRef.current;
      if (!nav) return;
      
      const focusableSelectors = 'button, a, input';
      const focusableElements = Array.from(nav.querySelectorAll(focusableSelectors)) as HTMLElement[];
      if (focusableElements.length === 0) return;

      const activeEl = document.activeElement as HTMLElement;
      const currentIndex = focusableElements.indexOf(activeEl);

      let nextIndex = 0;
      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex + 1 < focusableElements.length ? currentIndex + 1 : 0;
      } else if (e.key === 'ArrowUp') {
        nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : focusableElements.length - 1;
      }

      focusableElements[nextIndex].focus();
    }
  };

  // ----------------------------------------------------
  // Sync States with LocalStorage
  // ----------------------------------------------------
  useEffect(() => {
    localStorage.setItem('sh_services_v1', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('sh_submissions_v1', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('sh_accessibility_v1', JSON.stringify(accessibility));
    
    // Apply classes to Root <html> tag for global style multipliers
    const htmlEl = document.documentElement;
    
    // Text size scales
    htmlEl.classList.remove('size-large', 'size-extra-large');
    if (accessibility.textSize === 'large') htmlEl.classList.add('size-large');
    if (accessibility.textSize === 'extra-large') htmlEl.classList.add('size-extra-large');

    // Dyslexia Font
    if (accessibility.dyslexiaFont) {
      htmlEl.classList.add('dyslexic-font');
    } else {
      htmlEl.classList.remove('dyslexic-font');
    }

    // High Contrast / Grayscale
    htmlEl.classList.remove('contrast-high-mode', 'grayscale');
    if (accessibility.contrast === 'high') {
      htmlEl.classList.add('contrast-high-mode');
    } else if (accessibility.contrast === 'grayscale') {
      htmlEl.classList.add('grayscale');
    }
  }, [accessibility]);

  // ----------------------------------------------------
  // Text-To-Speech (TTS) SpeechSynthesis Engine
  // ----------------------------------------------------
  const speakText = (text: string) => {
    if (accessibility.textToSpeech && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // kill old queues
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Automated accessibility screen-reader on hover!
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      if (!accessibility.textToSpeech) return;
      
      const target = e.target as HTMLElement;
      // Seek elements with data-talk or buttons/links and speak them
      const talkAttr = target.getAttribute('data-talk') || target.getAttribute('aria-label');
      if (talkAttr) {
        speakText(talkAttr);
        target.classList.add('speech-highlight');
      } else if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'H3' || target.tagName === 'H4') {
        const textContent = target.innerText || target.getAttribute('title');
        if (textContent && textContent.length < 150) {
          speakText(textContent);
          target.classList.add('speech-highlight');
        }
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      target.classList.remove('speech-highlight');
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, [accessibility.textToSpeech]);

  // ----------------------------------------------------
  // Dynamic Handlers (Submission lifecycle)
  // ----------------------------------------------------
  const handleAddNewService = (newService: ServiceTemplate) => {
    setServices(prev => [newService, ...prev]);
  };

  const handleSubmitForm = (service: ServiceTemplate, formData: Record<string, any>) => {
    const trackingCode = formData.__code;
    const applicantName = formData.__applicantName;
    
    // Strip layout helper parameters
    const cleanData = { ...formData };
    delete cleanData.__code;
    delete cleanData.__applicantName;

    // Build timeline dates
    const dateNowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const initialSteps: StatusTimelineStep[] = [
      {
        status: 'DIAJUKAN',
        title: 'Berkas Diterima',
        description: 'Permohonan Anda berhasil masuk ke database Sobat Hijau DLH.',
        updatedAt: dateNowStr,
        isCompleted: true
      },
      {
        status: 'VERIFIKASI_ADMIN',
        title: 'Verifikasi Administrasi',
        description: 'Pemeriksaan kesesuaian berkas dan kelengkapan data oleh petugas.',
        updatedAt: '-',
        isCompleted: false
      },
      {
        status: 'SURVEY_TEKNIS',
        title: 'Pemeriksaan Teknis / Lapangan',
        description: 'Peninjauan langsung ke lokasi dan identifikasi parameter lapangan.',
        updatedAt: '-',
        isCompleted: false
      },
      {
        status: 'PROSES_REKOMENDASI',
        title: 'Penerbitan Surat Rekomendasi',
        description: 'Format naskah surat dan validasi dari kepala dinas.',
        updatedAt: '-',
        isCompleted: false
      },
      {
        status: 'SELESAI',
        title: 'Selesai & Serah Terima',
        description: 'Dokumen final telah diterbitkan dan siap diunduh atau diambil.',
        updatedAt: '-',
        isCompleted: false
      }
    ];

    const newSubmission: Submission = {
      id: trackingCode,
      serviceId: service.id,
      serviceName: service.name,
      submittedAt: dateNowStr,
      status: 'DIAJUKAN',
      applicantName,
      formData: cleanData,
      timeline: initialSteps
    };

    setSubmissions(prev => [newSubmission, ...prev]);
    addToast(`Permohonan ${service.name} diajukan! Kode Lacak: ${trackingCode}`, 'success');
  };

  const handleUpdateStatus = (id: string, newStatus: SubmissionStatus, adminNote?: string) => {
    const subObj = submissions.find(s => s.id === id);
    if (subObj) {
      const dateNowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const statusLabels: Record<SubmissionStatus, string> = {
        DIAJUKAN: 'DIAJUKAN',
        VERIFIKASI_ADMIN: 'VERIFIKASI ADMINISTRASI',
        SURVEY_TEKNIS: 'SURVEI TEKNIS LAPANGAN',
        PROSES_REKOMENDASI: 'PROSES PENYUSUNAN REKOMENDASI',
        SELESAI: 'SELESAI, REKOMENDASI SIAP DIUNDUH',
        DITOLAK: 'BERKAS DITOLAK / DIKEMBALIKAN'
      };

      const customMsg = newStatus === 'DITOLAK'
        ? `Permohonan ${subObj.serviceName} (${id}) ditolak: "${adminNote || 'Syarat berkas tidak terpenuhi'}"`
        : `Status berkas ${subObj.serviceName} (${id}) diperbarui menjadi [${statusLabels[newStatus]}].`;

      const newNotif: AppNotification = {
        id: `notif-${Math.random().toString(36).substring(2, 9)}`,
        submissionId: id,
        applicantName: subObj.applicantName,
        serviceName: subObj.serviceName,
        newStatus: newStatus,
        message: customMsg,
        timestamp: dateNowStr,
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    const updated = submissions.map(sub => {
      if (sub.id !== id) return sub;

      const dateNowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      
      // Map statuses ordered list 
      const statusOrder: SubmissionStatus[] = ['DIAJUKAN', 'VERIFIKASI_ADMIN', 'SURVEY_TEKNIS', 'PROSES_REKOMENDASI', 'SELESAI'];
      const targetIdx = statusOrder.indexOf(newStatus === 'DITOLAK' ? 'VERIFIKASI_ADMIN' : newStatus);

      const updatedTimeline = sub.timeline.map((step, sIdx) => {
        // Handle normal steps completion
        const stepOrderIdx = statusOrder.indexOf(step.status);
        let completed = stepOrderIdx <= targetIdx;
        let dateVal = step.updatedAt !== '-' ? step.updatedAt : '';

        if (step.status === newStatus || (newStatus === 'DITOLAK' && step.status === 'VERIFIKASI_ADMIN')) {
          dateVal = dateNowStr;
          completed = true;
        }

        const noteVal = step.status === newStatus ? adminNote : step.notes;

        // Customise wording for Ditolak state
        let updatedTitle = step.title;
        let updatedDesc = step.description;
        if (newStatus === 'DITOLAK' && step.status === 'VERIFIKASI_ADMIN') {
          updatedTitle = 'Pemberitahuan Ditolak';
          updatedDesc = adminNote || 'Sarat administratif tidak terpenuhi. Silakan periksa kembali berkas Anda atau hubungi admin.';
        }

        return {
          ...step,
          title: updatedTitle,
          description: updatedDesc,
          isCompleted: completed,
          updatedAt: dateVal || '-',
          notes: noteVal
        };
      });

      return {
        ...sub,
        status: newStatus,
        timeline: updatedTimeline
      };
    });

    setSubmissions(updated);
  };

  const handleDeleteSubmission = (id: string) => {
    const confirmDel = window.confirm(`Apakah Anda yakin ingin menghapus permohonan dengan kode ${id}?`);
    if (confirmDel) {
      setSubmissions(prev => prev.filter(sub => sub.id !== id));
    }
  };

  const routeToTracking = (code: string) => {
    setTrackSearchCode(code);
    setPortal('guest');
    setActiveTab('lacak');
    addToast(`Melacak kemajuan berkas dengan kode: ${code}`, 'info');
  };

  const changeTab = (tabName: string) => {
    setActiveTab(tabName);
    let tabIndo = "";
    if (tabName === 'beranda') tabIndo = "Beranda Utama";
    else if (tabName === 'layanan') tabIndo = "Formulir Layanan Kami";
    else if (tabName === 'lacak') tabIndo = "Lacak Berkas Permohonan";
    else if (tabName === 'buat-form') tabIndo = "Rancang Formulir Dinamis";
    else if (tabName === 'asisten') tabIndo = "Chat Asisten Cerdas";
    else if (tabName === 'admin') tabIndo = "Panel Administrator";
    
    speakText(`Membuka tab ${tabIndo}`);
  };

  const showKelolaBerkas = "Kelola Berkas Masuk".toLowerCase().includes(sidebarSearchQuery.toLowerCase());
  const showRancangLayanan = "Rancang Layanan Baru".toLowerCase().includes(sidebarSearchQuery.toLowerCase());
  const showKembaliWebsite = "Kembali ke Website".toLowerCase().includes(sidebarSearchQuery.toLowerCase());

  const pendingCount = submissions.filter(s => s.status === 'DIAJUKAN' || s.status === 'VERIFIKASI_ADMIN').length;

  return (
    <div className={portal === 'admin' ? "min-h-screen bg-stone-100 dark:bg-stone-950 flex transition-colors duration-300 relative text-[#081C15] dark:text-stone-100" : "min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col transition-colors duration-300 relative text-[#081C15] dark:text-stone-100"}>
      
      {/* Floating Toast Notification Deck */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none" id="global-toasts-viewport">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-[11px] font-bold leading-relaxed tracking-wide flex items-start gap-4 justify-between animate-fade-in backdrop-blur-md transition-all duration-300 ${
              toast.type === 'success' 
                ? 'bg-[#E5F5EB]/95 dark:bg-emerald-950/95 text-[#1B4332] dark:text-emerald-100 border-emerald-200 dark:border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-50/95 dark:bg-rose-950/95 text-rose-950 dark:text-rose-150 border-rose-200 dark:border-rose-900'
                : 'bg-indigo-50/95 dark:bg-slate-900/95 text-indigo-950 dark:text-indigo-150 border-indigo-200 dark:border-slate-800'
            }`}
          >
            <div className="flex-1 text-left">
              {toast.message}
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer self-start mt-0.5"
            >
              <X className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        ))}
      </div>
      
      {/* ----------------------------------------------------
          ACCESSIBILITY PANEL FLOATER WIDGET
          ---------------------------------------------------- */}
      <AccessibilityWidget settings={accessibility} onChange={setAccessibility} />

      {/* Admin Activity Log Modal */}
      <AnimatePresence>
        {isActivityLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans text-stone-900 dark:text-stone-100">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsActivityLogModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
            />
            
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
              className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200/60 dark:border-stone-800/80 w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[85vh] pointer-events-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-stone-150 dark:border-stone-850 flex items-center justify-between bg-gradient-to-r from-emerald-950/20 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-650 dark:text-emerald-400">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#081C15] dark:text-stone-100 uppercase tracking-tight">Catatan Log Aktivitas Admin</h3>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">SOBATHIJAU SECURITY AUDIT RAIL</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActivityLogModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-805 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Log Content list */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed flex items-start gap-2.5 text-left">
                  <span className="text-amber-500 text-sm mt-0.5 leading-none">⚠️</span>
                  <div>
                    <span className="font-bold">Keamanan & Audit Lingkungan:</span> Aktivitas ini direkam dalam sistem audit log terpusat Dinas Lingkungan Hidup Pontianak guna menjamin transparansi publik.
                  </div>
                </div>

                <div className="space-y-3">
                  {adminActivityLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-3.5 rounded-2xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 flex items-start gap-3 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-colors text-left"
                    >
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${log.iconType === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400'}`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-xs text-stone-750 dark:text-stone-200 font-semibold leading-normal">{log.action}</p>
                        <p className="text-[9px] text-stone-400 dark:text-stone-500 font-mono tracking-wider">{log.timestamp} WIB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-stone-50 dark:bg-stone-900/60 border-t border-stone-150 dark:border-stone-850 flex items-center justify-between text-[11px]">
                <span className="text-stone-400 dark:text-stone-500 font-mono text-[9px]">TOTAL LOGS: {adminActivityLogs.length} REC</span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminActivityLogs([
                      { id: `log-${Date.now()}`, action: 'Admin menyegarkan catatan audit log lokal (refresh log)', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16), iconType: 'info' },
                      ...adminActivityLogs
                    ]);
                    addToast('Log aktivitas diperbarui dengan entri segarkan log.', 'info');
                  }}
                  className="text-stone-500 hover:text-emerald-500 dark:hover:text-emerald-400 select-none cursor-pointer font-bold transition"
                >
                  Segarkan Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {portal === 'admin' ? (
        // ----------------------------------------------------
        // ADMIN PORTAL - SEPARATE PAGE WITH RESPONSIVE LEFT SIDEBAR
        // ----------------------------------------------------
        <div className="flex w-full min-h-screen relative overflow-x-hidden">
          
          {/* Backdrop Overlay for Mobile Sidebar */}
          {isAdminSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setIsAdminSidebarOpen(false)}
            />
          )}

          {/* Admin Left Sidebar */}
          <aside className={`fixed md:sticky top-0 bottom-0 left-0 z-50 h-screen w-64 bg-[#081C15] text-stone-100 flex flex-col shrink-0 border-r border-[#1B4332]/40 transition duration-300 md:hover:translate-x-1 hover:shadow-2xl hover:shadow-emerald-950/40 ${isAdminSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-hidden shadow-2xl md:shadow-none`}>
            {/* Sidebar Brand header with enlarged seal & Close button */}
            <div className="p-6 border-b border-[#1B4332]/30 flex flex-col items-center text-center gap-3 relative shrink-0">
              {/* Close Button on Mobile */}
              <button 
                onClick={() => setIsAdminSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white bg-white/10 hover:bg-white/20 md:hidden"
                aria-label="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/0/02/Seal_of_Pontianak.svg" 
                alt="Logo Pemkot Pontianak" 
                className="w-16 h-16 object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 my-1.5">
                  <span className="bg-emerald-850 text-emerald-200 text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider font-extrabold">
                    ADMIN PORTAL
                  </span>
                </div>
                <h2 className="text-sm font-extrabold tracking-tight text-emerald-400">
                  SobatHijau <span className="text-white font-normal">DLH</span>
                </h2>
                <p className="text-[9px] text-stone-400 uppercase font-mono tracking-widest">
                  KOTA PONTIANAK
                </p>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="flex-1 relative overflow-hidden flex flex-col h-[calc(100vh-210px)] md:h-[calc(100vh-250px)]">
              <nav 
                className="flex-1 p-4 space-y-3 overflow-y-auto overscroll-y-contain scrollbar-hide" 
                id="admin-sidebar-nav"
                ref={adminSidebarNavRef}
                onKeyDown={handleSidebarKeyDown}
              >
                {/* Search Input Filter */}
                <div className="px-1 mb-3 sticky top-0 bg-[#081C15]/95 backdrop-blur-md pb-2 z-10">
                  <div className="relative font-sans">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2D6A4F]" />
                    <input
                      ref={sidebarSearchInputRef}
                      type="text"
                      className="w-full bg-[#05130E]/90 border border-[#1B4332]/50 rounded-lg pl-8 pr-12 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                      placeholder="Cari Menu... (Ctrl+K)"
                      value={sidebarSearchQuery}
                      onChange={(e) => setSidebarSearchQuery(e.target.value)}
                    />
                    {sidebarSearchQuery ? (
                      <button
                        onClick={() => setSidebarSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-white rounded bg-stone-850 hover:bg-stone-850 transition"
                        title="Bersihkan Pencarian"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    ) : (
                      <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1 py-0.5 bg-[#1B4332]/60 text-[#52B788] text-[8px] rounded font-mono border border-[#2D6A4F]/40 pointer-events-none">
                        Ctrl K
                      </kbd>
                    )}
                  </div>
                </div>

                {/* Quick Actions Panel */}
                { !sidebarSearchQuery && (
                  <div className="px-1 mb-4">
                    <div className="text-[9px] text-[#2D6A4F] font-bold uppercase tracking-widest px-1 mb-2 font-sans flex items-center gap-1.5">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                      <span>Aksi Cepat Admin</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAdminSubTab('rancang');
                          setIsAdminSidebarOpen(false);
                          addToast('Membuka perancang pembuatan berkas/formulir baru', 'success');
                          speakText('Membuka perancang layanan baru');
                        }}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-[#113124]/90 to-[#0A1F16]/95 border border-[#1B4332]/60 hover:border-emerald-500/50 hover:scale-105 active:scale-95 text-stone-200 hover:text-white transition-all duration-200 ease-out group text-center gap-1"
                      >
                        <Plus className="w-4 h-4 text-emerald-400 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-[9px] font-extrabold leading-tight">Buat Berkas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsActivityLogModalOpen(true);
                          speakText('Membuka catatan riwayat keamanan dan aktivitas admin');
                        }}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-[#113124]/90 to-[#0A1F16]/95 border border-[#1B4332]/60 hover:border-emerald-500/50 hover:scale-105 active:scale-95 text-stone-200 hover:text-white transition-all duration-200 ease-out group text-center gap-1"
                      >
                        <Activity className="w-4 h-4 text-emerald-400 group-hover:animate-pulse" />
                        <span className="text-[9px] font-extrabold leading-tight">Log Aktivitas</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Separator - Pembatas Visual di Bawah Quick Actions */}
                { !sidebarSearchQuery && (
                  <div className="mx-1 my-3 border-t border-[#133124] shadow-[0_1px_0_rgba(255,255,255,0.02)]" />
                )}

                {/* Collapsible Group 1: Menu Utama */}
                { (showKelolaBerkas || showRancangLayanan) && (
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setIsMenuUtamaOpen(!isMenuUtamaOpen)}
                      className="w-full text-[9px] text-[#2D6A4F] hover:text-emerald-400 font-bold uppercase tracking-widest px-3 py-1 flex items-center justify-between transition-all duration-200 hover:scale-105 active:scale-95 text-left"
                      aria-expanded={isMenuUtamaOpen || sidebarSearchQuery !== ''}
                    >
                      <span className="font-sans">Menu Utama</span>
                      {(isMenuUtamaOpen || sidebarSearchQuery !== '') ? (
                        <ChevronDown className="w-3 h-3 text-emerald-500/80" />
                      ) : (
                        <ChevronUp className="w-3 h-3 text-[#2D6A4F]" />
                      )}
                    </button>

                    {(isMenuUtamaOpen || sidebarSearchQuery !== '') && (
                      <div className="space-y-1.5 pl-1 pt-1">
                        {showKelolaBerkas && (
                          <button
                            type="button"
                            onClick={() => {
                              setAdminSubTab('kelola');
                              setIsAdminSidebarOpen(false);
                              speakText("Membuka Kelola Berkas Masuk");
                            }}
                            data-active={adminSubTab === 'kelola'}
                            className={`w-full px-3 py-2.5 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-between text-left border-l-4 text-xs ${
                              adminSubTab === 'kelola'
                                ? 'bg-[#1B4332] text-white shadow-sm border-l-emerald-400 pl-2 rounded-r-xl rounded-l-none font-bold'
                                : 'text-stone-300 hover:bg-[#1B4332]/30 hover:text-white border-l-transparent pl-2 rounded-xl font-bold'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="truncate">Kelola Berkas Masuk</span>
                            </div>
                            {pendingCount > 0 && (
                              <span className="bg-amber-500 text-[#081C15] text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse shadow-sm shrink-0">
                                {pendingCount}
                              </span>
                            )}
                          </button>
                        )}

                        {showRancangLayanan && (
                          <button
                            type="button"
                            onClick={() => {
                              setAdminSubTab('rancang');
                              setIsAdminSidebarOpen(false);
                              speakText("Membuka Perancang Formulir Layanan");
                            }}
                            data-active={adminSubTab === 'rancang'}
                            className={`w-full px-3 py-2.5 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2.5 text-left border-l-4 text-xs ${
                              adminSubTab === 'rancang'
                                ? 'bg-[#1B4332] text-white shadow-sm border-l-emerald-400 pl-2 rounded-r-xl rounded-l-none font-bold'
                                : 'text-stone-300 hover:bg-[#1B4332]/30 hover:text-white border-l-transparent pl-2 rounded-xl font-bold'
                            }`}
                          >
                            <Settings className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="truncate">Rancang Layanan Baru</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Separator - Pembatas Visual yang Lebih Tegas */}
                { ((showKelolaBerkas || showRancangLayanan) && showKembaliWebsite) && (
                  <div className="mx-2 my-4 border-t border-[#1B4332]/50 shadow-[0_1px_0_rgba(255,255,255,0.03)]" />
                )}

                {/* Collapsible Group 2: Portal Publik */}
                { showKembaliWebsite && (
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setIsPortalPublikOpen(!isPortalPublikOpen)}
                      className="w-full text-[9px] text-[#2D6A4F] hover:text-emerald-400 font-bold uppercase tracking-widest px-3 py-1 flex items-center justify-between transition-all duration-200 hover:scale-105 active:scale-95 text-left"
                      aria-expanded={isPortalPublikOpen || sidebarSearchQuery !== ''}
                    >
                      <span className="font-sans">Portal Publik</span>
                      {(isPortalPublikOpen || sidebarSearchQuery !== '') ? (
                        <ChevronDown className="w-3 h-3 text-emerald-500/80" />
                      ) : (
                        <ChevronUp className="w-3 h-3 text-[#2D6A4F]" />
                      )}
                    </button>

                    {(isPortalPublikOpen || sidebarSearchQuery !== '') && (
                      <div className="space-y-1.5 pl-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPortal('guest');
                            setActiveTab('beranda');
                            setIsAdminSidebarOpen(false);
                            speakText("Membuka Portal Website Utama");
                          }}
                          className="w-full px-3 py-2.5 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2.5 text-left border-l-4 border-l-transparent pl-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/20 hover:text-rose-200"
                        >
                          <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="truncate">Kembali ke Website</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* No Results Fallback */}
                {(!showKelolaBerkas && !showRancangLayanan && !showKembaliWebsite) && (
                  <div className="py-8 px-4 text-center text-stone-500 text-xs">
                    <HelpCircle className="w-8 h-8 text-stone-600 mx-auto mb-2 opacity-60" />
                    <p className="font-medium">Menu tidak ditemukan</p>
                    <button 
                      type="button"
                      onClick={() => setSidebarSearchQuery('')} 
                      className="text-emerald-400 font-bold hover:underline mt-1.5 block w-full text-center"
                    >
                      Bersihkan Pencarian
                    </button>
                  </div>
                )}
              </nav>

              {/* Elegant scroll fade indicator at the bottom of the navigation area */}
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#081C15] via-[#081C15]/75 to-transparent pointer-events-none z-10 animate-pulse" />
            </div>

            <div className="p-4 bg-[#05130E] border-t border-[#1B4332]/25 text-[9px] text-stone-500 font-mono text-center shrink-0">
              DLH Pontianak Admin Portal
            </div>
          </aside>

          {/* Admin Workspace Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Bar */}
            <header className="bg-white dark:bg-stone-900 border-b border-stone-200/55 dark:border-stone-850 px-4 md:px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Burger Button for Mobile */}
                <button
                  onClick={() => setIsAdminSidebarOpen(true)}
                  className="p-2 -ml-1 rounded-xl text-[#081C15] dark:text-stone-100 hover:bg-slate-100 dark:hover:bg-stone-800 md:hidden transition"
                  aria-label="Buka Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="text-left">
                  <h1 className="text-xs sm:text-sm font-bold text-[#1B4332] dark:text-stone-100 flex items-center gap-2 uppercase tracking-wide">
                    {adminSubTab === 'kelola' ? '📋 Manajemen Berkas & Dokumen Publik' : '🛠️ Design Studio & Custom Form Creator'}
                  </h1>
                  <p className="text-[11px] text-slate-400 dark:text-stone-500 mt-1 hidden sm:block">
                    {adminSubTab === 'kelola' 
                      ? 'Tinjau, perbarui status timeline, atau kelola berkas administrasi pemohon.' 
                      : 'Design parameter masukan input, syarat administrasi, dan jenis layanan baru.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] text-emerald-800 bg-emerald-50 dark:bg-stone-850 dark:text-emerald-300 px-3 py-1 rounded-full font-bold font-mono">
                  🟢 ADMINISTRATOR ONLINE
                </span>
              </div>
            </header>

            {/* Main Content Body with Switch Transitions */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
              {/* Hierarchical Navigation Breadcrumb */}
              <div id="admin-breadcrumbs" className="mb-6 flex items-center gap-2 text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-medium select-none">
                <span 
                  onClick={() => {
                    setPortal('guest');
                    setActiveTab('beranda');
                    speakText("Kembali ke portal utama");
                  }} 
                  className="hover:text-[#1B4332] dark:hover:text-emerald-400 transition cursor-pointer font-bold"
                >
                  SobatHijau
                </span>
                <span className="text-stone-300 dark:text-stone-700">/</span>
                <span 
                  onClick={() => {
                    setAdminSubTab('kelola');
                    speakText("Membuka halaman kelola berkas masuk");
                  }} 
                  className="hover:text-[#1B4332] dark:hover:text-emerald-400 transition cursor-pointer font-bold"
                >
                  Panel Admin
                </span>
                <span className="text-stone-300 dark:text-stone-700">/</span>
                <span className="text-emerald-650 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                  {adminSubTab === 'kelola' ? 'Kelola Berkas Masuk' : 'Rancang Layanan Baru'}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={adminSubTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                >
                  {adminSubTab === 'kelola' ? (
                    <AdminPanel 
                      submissions={submissions}
                      onUpdateStatus={handleUpdateStatus}
                      onDeleteSubmission={handleDeleteSubmission}
                      onSelectTracking={routeToTracking}
                      onSpeak={speakText}
                    />
                  ) : (
                    <FormCreator 
                      onSave={(newService) => {
                        handleAddNewService(newService);
                        setAdminSubTab('kelola');
                        speakText("Formulir sukses terdaftar di portal pelayanan!");
                      }} 
                      onSpeak={speakText}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>

            <footer className="bg-white dark:bg-stone-900 border-t border-stone-200/55 dark:border-stone-850 py-4 px-8 text-center text-[10px] text-slate-400 font-mono">
              PANEL ADMINISTRATOR SOBAT HIJAU DINAS LINGKUNGAN HIDUP KOTA PONTIANAK | © 2026 BASELINE
            </footer>
          </div>

        </div>
      ) : (
        // ----------------------------------------------------
        // PUBLIC GUEST PORTAL
        // ----------------------------------------------------
        <div className="flex flex-col flex-1 w-full">
          
          {/* TOP ACCESSIBILITY BAR */}
          <div className="bg-[#1B4332] text-[#D8E2DC] px-4 md:px-8 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[0.72rem] font-medium border-b border-emerald-900 w-full min-h-max" id="top-accessibility-helper-bar">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className={`w-2 h-2 rounded-full ${accessibility.contrast === 'high' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                Kontras: <strong className="uppercase">{accessibility.contrast === 'high' ? 'Tinggi' : accessibility.contrast === 'grayscale' ? 'Monokrom' : 'Alami'}</strong>
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className={`w-2 h-2 rounded-full ${accessibility.textToSpeech ? 'bg-emerald-400' : 'bg-stone-500'}`}></span>
                Asisten Suara: <strong className="uppercase">{accessibility.textToSpeech ? 'Aktif' : 'Mati'}</strong>
              </span>
              {accessibility.dyslexiaFont && (
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span>Font: <strong>DYSLEXIA</strong></span>
                </span>
              )}
            </div>
            <div className="flex gap-1.5 mt-1 sm:mt-0 items-center justify-center">
              <button 
                onClick={() => setAccessibility(prev => ({ ...prev, textSize: 'normal' }))}
                className={`px-2 py-0.5 rounded text-[0.68rem] border transition ${accessibility.textSize === 'normal' ? 'bg-[#2D6A4F] text-white border-emerald-400 font-extrabold' : 'border-emerald-700/60 hover:bg-emerald-850'}`}
              >
                A-
              </button>
              <button 
                onClick={() => setAccessibility(prev => ({ ...prev, textSize: 'large' }))}
                className={`px-2 py-0.5 rounded text-[0.68rem] font-extrabold border transition ${accessibility.textSize === 'large' ? 'bg-[#2D6A4F] text-white border-emerald-400 font-black' : 'border-emerald-700/60 hover:bg-emerald-850'}`}
              >
                A
              </button>
              <button 
                onClick={() => setAccessibility(prev => ({ ...prev, textSize: 'extra-large' }))}
                className={`px-2 py-0.5 rounded text-[0.68rem] font-black border transition ${accessibility.textSize === 'extra-large' ? 'bg-[#2D6A4F] text-white border-emerald-400' : 'border-emerald-700/60 hover:bg-emerald-850'}`}
              >
                A+
              </button>
            </div>
          </div>

          {/* MAIN BRAND HEADER PANEL (PROPORTIONAL WITH ENLARGED LOGO) */}
          <header className="bg-white dark:bg-stone-900 border-b border-emerald-150 dark:border-stone-850 py-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              
              <div className="flex items-center gap-4.5 text-left">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/0/02/Seal_of_Pontianak.svg" 
                  alt="Logo Pemkot Pontianak" 
                  className="w-14 h-14 md:w-16 md:h-16 object-contain shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#1B4332] text-[#D8E2DC] font-black text-[9px] px-2 py-0.5 rounded-full font-mono uppercase tracking-widest">
                      DLH PORTAL
                    </span>
                    <span className="text-[10px] text-[#2D6A4F] dark:text-emerald-400 font-mono tracking-wider font-bold">Pemerintah Kota Pontianak</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#1B4332] dark:text-emerald-400 mt-1 leading-tight" id="web-logo-title">
                    SobatHijau <span className="font-normal text-emerald-600">DLH</span>
                  </h1>
                  <p className="text-gray-400 dark:text-stone-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">Sistem Pelayanan Online Terpadu Dinas Lingkungan Hidup</p>
                </div>
              </div>

              {/* Quick numbers & Access Admin Port */}
              <div className="flex items-center gap-6 text-xs text-right pl-0 md:pl-6 h-10 border-t md:border-t-0 md:border-l border-emerald-100 dark:border-stone-800 pt-3 md:pt-0 justify-between md:justify-end">
                <div className="hidden lg:block">
                  <p className="text-[#2D6A4F] dark:text-emerald-400 text-[9px] font-mono tracking-widest uppercase font-bold">Email Unit Kerja</p>
                  <p className="font-bold text-[#1B4332] dark:text-stone-200 mt-0.5 hover:text-[#2D6A4F] transition">dlh@pontianak.go.id</p>
                </div>
                <div className="hidden lg:block font-mono">
                  <p className="text-[#2D6A4F] dark:text-emerald-400 text-[9px] tracking-widest uppercase font-bold">Jam Kerja Dinas</p>
                  <p className="font-bold text-slate-700 dark:text-stone-300 mt-0.5">Senin-Jum'at: 7am-16pm</p>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setPortal('admin');
                      setAdminSubTab('kelola');
                      speakText("Beralih ke Portal Administrasi");
                    }}
                    className="px-4 py-2 bg-[#E5F5EB] hover:bg-[#1B4332] dark:bg-stone-800 hover:text-white text-[#1B4332] dark:text-emerald-300 border border-emerald-200 dark:border-stone-700 text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
                  >
                    <span>Akses Admin 🔐</span>
                  </button>
                </div>
              </div>

            </div>
          </header>

          {/* PRIMARY NAVIGATION CONTROLS */}
          <nav className="bg-[#FFFFFF]/95 dark:bg-[#1C1917]/95 border-b border-emerald-100/60 dark:border-stone-850 backdrop-blur-md sticky top-0 z-40 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4" id="main-navigation-menu">
              <div className="grid grid-cols-4 md:flex md:space-x-1 py-1 w-full md:w-auto">
                <button
                  onClick={() => changeTab('beranda')}
                  className={`py-3 md:px-4 text-[10px] sm:text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap border-b-2 ${
                    activeTab === 'beranda' 
                      ? 'border-[#1B4332] text-[#1B4332] dark:border-emerald-400 dark:text-emerald-400 font-extrabold' 
                      : 'border-transparent text-gray-500 dark:text-stone-400 hover:text-[#1B4332] dark:hover:text-amber-400'
                  }`}
                >
                  <Leaf className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Beranda</span>
                </button>
                <button
                  onClick={() => changeTab('layanan')}
                  className={`py-3 md:px-4 text-[10px] sm:text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap border-b-2 ${
                    activeTab === 'layanan' 
                      ? 'border-[#1B4332] text-[#1B4332] dark:border-emerald-400 dark:text-emerald-400 font-extrabold' 
                      : 'border-transparent text-gray-500 dark:text-stone-400 hover:text-[#1B4332] dark:hover:text-amber-400'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Layanan</span>
                </button>
                <button
                  onClick={() => changeTab('lacak')}
                  className={`py-3 md:px-4 text-[10px] sm:text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap border-b-2 ${
                    activeTab === 'lacak' 
                      ? 'border-[#1B4332] text-[#1B4332] dark:border-emerald-400 dark:text-emerald-400 font-extrabold' 
                      : 'border-transparent text-gray-500 dark:text-stone-400 hover:text-[#1B4332] dark:hover:text-amber-400'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Lacak</span>
                </button>
                <button
                  onClick={() => changeTab('asisten')}
                  className={`py-3 md:px-4 text-[10px] sm:text-xs font-bold transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap border-b-2 ${
                    activeTab === 'asisten' 
                      ? 'border-[#1B4332] text-[#1B4332] dark:border-emerald-400 dark:text-emerald-400 font-extrabold' 
                      : 'border-transparent text-gray-500 dark:text-stone-400 hover:text-[#1B4332] dark:hover:text-amber-400'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Asisten</span>
                </button>
              </div>

              {/* Public Notifications in top-right corner of the public portal */}
              <div className="flex items-center py-1.5">
                <PublicNotifications
                  notifications={notifications}
                  onMarkRead={handleMarkNotificationRead}
                  onMarkAllRead={handleMarkAllNotificationsRead}
                  onClearAll={handleClearNotifications}
                  onSelectNotification={handleSelectNotification}
                />
              </div>
            </div>
          </nav>

      {/* PUBLIC BODY PANELS WITH framer-motion CONTAINER */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full transition-colors duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* 1. HOME TAB */}
            {activeTab === 'beranda' && (
              <div className="space-y-8 animate-fade-in" id="home-view-tab">
                
                {/* Visual Hero Billboard Banner */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center bg-white dark:bg-stone-900 border border-emerald-100 dark:border-stone-850 p-6 md:p-8 rounded-2xl shadow-sm text-left">
                  <div className="xl:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-1.5 bg-[#E5F5EB] dark:bg-stone-850 border border-emerald-200/50 px-3 py-1 rounded-full text-[10px] font-bold text-[#1B4332] dark:text-emerald-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Era Baru Pelayanan Lingkungan Hijau Digital</span>
                    </div>
                    <h2 className="text-xl md:text-3xl font-bold text-[#1B4332] dark:text-stone-50 leading-tight">
                      Pelayanan Responsif, <br />
                      <span className="text-[#2D6A4F] dark:text-emerald-400">Bebas Hambatan & Terbuka</span> Untuk Semua
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed">
                      Sobat Hijau adalah portal pelayanan publik Dinas Lingkungan Hidup Kabupaten/Kota Pontianak. Didesain secara khusus untuk memenuhi standar kegunaan tertinggi demi melayani pengurusan SPPL mikro, pengaduan lingkungan hidup bebas pencemaran, serta permintaan bibit tanaman penghijauan dengan andal dan transparan.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-3">
                      <button 
                        onClick={() => changeTab('layanan')}
                        className="px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-xl text-xs shadow-sm transition"
                      >
                        Ajukan Permohonan Baru
                      </button>
                      <button 
                        onClick={() => changeTab('lacak')}
                        className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-[#1B4332] dark:bg-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs border border-emerald-100 dark:border-stone-750 transition"
                      >
                        Lacak Kemajuan Berkas
                      </button>
                    </div>
                  </div>
                  <div className="lg:col-span-12 xl:col-span-5 relative w-full space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                      {/* STATS CARD INDEKS KUALITAS LINGKUNGAN HIDUP */}
                      <div className="bg-emerald-50 bg-opacity-70 dark:bg-stone-850 rounded-2xl border border-emerald-100 dark:border-stone-800 p-5 flex flex-col justify-between text-left shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-black uppercase bg-emerald-850 text-emerald-100 px-2 py-0.5 rounded tracking-wide">
                            KLASIFIKASI IKLH
                          </span>
                          <TrendingUp className="w-5 h-5 text-[#2D6A4F] dark:text-emerald-400" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-[10px] font-extrabold text-slate-500 dark:text-stone-400 uppercase tracking-tight">
                            INDEKS KUALITAS LINGKUNGAN HIDUP KOTA PONTIANAK TAHUN 2025
                          </h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl md:text-4xl font-black text-[#1B4332] dark:text-emerald-400 font-mono">
                              65.69
                            </span>
                            <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-300 bg-[#E5F5EB] dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-mono">
                              CUKUP BAIK
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 dark:text-stone-550">
                            Pemantauan mutu air, udara, dan tutupan lahan secara berkala.
                          </p>
                        </div>
                      </div>

                      {/* OFFICE CONTACT INFO CARD */}
                      <div className="bg-[#F9FBFA] dark:bg-stone-850/40 rounded-2xl border border-emerald-50 dark:border-stone-800 p-5 text-left shadow-inner space-y-3">
                        <div className="flex items-center gap-1.5 border-b border-emerald-100/30 pb-2">
                          <MapPin className="w-4 h-4 text-[#2D6A4F] dark:text-emerald-400 shrink-0" />
                          <h4 className="text-[10px] font-black text-[#1B4332] dark:text-stone-200 uppercase tracking-wider">
                            INFORMASI HUBUNG RESMI DLH
                          </h4>
                        </div>
                        
                        <div className="space-y-2 text-[11px] text-slate-600 dark:text-stone-300">
                          <div className="flex items-start gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-emerald-450 mt-0.5 shrink-0" />
                            <div>
                              <strong className="text-slate-800 dark:text-stone-250 font-extrabold block text-[10px] uppercase">Jam Kerja Dinas:</strong>
                              <span>Senin-Jum'at: 7am-16pm</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-emerald-450 mt-0.5 shrink-0" />
                            <div>
                              <strong className="text-slate-800 dark:text-stone-250 font-extrabold block text-[10px] uppercase">Alamat Kantor:</strong>
                              <address className="not-italic leading-relaxed">
                                JL. Alianyang No. 7D, Kel. SUngai Bangkong, Kec. Pontianak kota kota pontianak Pontianak
                              </address>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Mail className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-emerald-450 mt-0.5 shrink-0" />
                            <div>
                              <strong className="text-slate-800 dark:text-stone-250 font-extrabold block text-[10px] uppercase">Email Hubung:</strong>
                              <a href="mailto:dlh@pontianak.go.id" className="text-emerald-700 dark:text-emerald-400 hover:underline transition font-bold">
                                dlh@pontianak.go.id
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Educational Carousel Section */}
                <EcoCarousel />

                {/* Quick action grid cards list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="features-highlights">
                  <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-slate-100 dark:border-stone-850 text-left space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-stone-800 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-stone-100">Pengisian Pintar</h4>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">Formulir cerdas menyesuaikan otomatis berdasarkan kategori layanan yang Anda pilih tanpa duplikasi berkas.</p>
                  </div>
                  <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-slate-100 dark:border-stone-850 text-left space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-stone-800 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-stone-100">Lacak Alur Berkas</h4>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">Dapatkan transparansi penuh atas berkas administrasi Anda sejak pengajuan hingga penerbitan dokumen selesai.</p>
                  </div>
                  <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-slate-100 dark:border-stone-850 text-left space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-stone-800 flex items-center justify-center">
                      <Accessibility className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-stone-100">Aksesibilitas Tinggi</h4>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">Dilengkapi setelan ramah tuna netra, pembaca suara otomatis, penyesuaian kontras tinggi, dan huruf khusus.</p>
                  </div>
                  <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-slate-100 dark:border-stone-850 text-left space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-stone-800 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-stone-100">Aduan Cepat</h4>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed">Laporkan pencemaran dengan opsi anonimitas terjamin untuk melindungi pelapor demi mengawasi lingkungan kota Pontianak.</p>
                  </div>
                </div>

                {/* Quick interactive search/track box in home */}
                <div className="p-6 bg-slate-50 dark:bg-stone-900 border border-slate-200 dark:border-stone-850 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-stone-100">Bisa langsung coba melacak berkas?</h4>
                    <p className="text-[10px] text-slate-400">Salin kode uji cepat ini untuk langsung diuji di tab Lacak.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {submissions.slice(0, 3).map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => routeToTracking(sub.id)}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-50 dark:bg-stone-850 dark:hover:bg-emerald-950 font-mono text-xs font-bold rounded-lg border border-slate-200 dark:border-stone-700 text-slate-700 dark:text-stone-300 transition"
                      >
                        Lacak Berkas: {sub.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Environmental Sebaran Map (D3.js) */}
                <EnvironmentalMap />

                {/* PROCEDURES & FAQ GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-slate-800 dark:text-stone-100">
                  {/* Sistem Alur Pengajuan Perizinan */}
                  <div className="bg-white dark:bg-stone-900 border border-emerald-100 dark:border-stone-850 p-6 rounded-2xl text-left shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-50 dark:border-stone-800/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-stone-800 text-[#1B4332] dark:text-emerald-400">
                            <FolderSync className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-extrabold text-xs text-[#1B4332] dark:text-emerald-400 uppercase tracking-tight">Sistem Alur Pengajuan Perizinan</h4>
                            <p className="text-[10px] text-slate-400">Tahapan transparan dari registrasi hingga dokumen disahkan.</p>
                          </div>
                        </div>

                        {/* Interactive Offline Caching Button */}
                        <button
                          onClick={handleCacheOffline}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-wide flex items-center gap-1.5 transition whitespace-nowrap ${
                            isCachedOffline 
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                              : 'bg-[#1B4332] text-white hover:bg-[#2D6A4F]'
                          }`}
                          title="Simpan alur prosedur perizinan ke browser untuk dibaca tanpa internet"
                        >
                          <Database className={`w-3 h-3 ${isCachedOffline ? '' : 'animate-bounce'}`} />
                          <span>{isCachedOffline ? `TERSIMPAN OFFLINE (${cacheTime})` : 'SIMPAN SECARA OFFLINE'}</span>
                        </button>
                      </div>

                      <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-emerald-100 dark:before:bg-stone-800">
                        {/* Step 1 */}
                        <div className="flex gap-4 relative">
                          <div className="w-9 h-9 rounded-full bg-emerald-700/10 dark:bg-[#1B4332] border-2 border-emerald-700 dark:border-emerald-500 flex items-center justify-center shrink-0 z-10 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                            1
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-slate-800 dark:text-stone-100">Pemilihan & Pengisian Form</h5>
                            <p className="text-[10.5px] text-slate-400 mt-0.5 leading-relaxed">
                              Pemohon memilih jenis instrumen lingkungan (AMDAL/UKL-UPL/SPPL) di tab <span className="font-bold text-emerald-700 dark:text-emerald-400 pointer-events-none">Layanan</span> dan mengisi parameter masukan dinamis secara digital.
                            </p>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-4 relative">
                          <div className="w-9 h-9 rounded-full bg-stone-50 dark:bg-stone-800 border-2 border-slate-200 dark:border-stone-700 flex items-center justify-center shrink-0 z-10 text-slate-500 dark:text-stone-400 font-bold text-xs">
                            2
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-slate-800 dark:text-stone-100">Verifikasi Dokumen Administrasi</h5>
                            <p className="text-[10.5px] text-slate-400 mt-0.5 leading-relaxed">
                              Petugas DLH memvalidasi data pengisian serta kesesuaian berkas pendukung wajib. Status kelayakan progres diperbarui secara live.
                            </p>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-4 relative">
                          <div className="w-9 h-9 rounded-full bg-stone-50 dark:bg-stone-800 border-2 border-slate-200 dark:border-stone-700 flex items-center justify-center shrink-0 z-10 text-slate-500 dark:text-stone-400 font-bold text-xs">
                            3
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-slate-800 dark:text-stone-100">Sidang Komisi & Evaluasi Lapangan</h5>
                            <p className="text-[10.5px] text-slate-400 mt-0.5 leading-relaxed">
                              Penilai komisi kelaikan lingkungan melakukan validasi fisik peninjauan koordinat sasar lapangan untuk memitigasi dampak ekologis.
                            </p>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex gap-4 relative">
                          <div className="w-9 h-9 rounded-full bg-stone-50 dark:bg-stone-800 border-2 border-slate-200 dark:border-stone-700 flex items-center justify-center shrink-0 z-10 text-slate-500 dark:text-stone-400 font-bold text-xs">
                            4
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-slate-800 dark:text-stone-100">Penerbitan SK Kelayakan Lingkungan</h5>
                            <p className="text-[10.5px] text-slate-400 mt-0.5 leading-relaxed">
                              Persetujuan resmi ditandatangani secara digital (TTE) oleh Kepala Dinas Lingkungan Hidup dan dapat langsung diunduh lewat tab lacak.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FAQ Accordion */}
                  <div className="bg-white dark:bg-stone-900 border border-emerald-100 dark:border-stone-850 p-6 rounded-2xl text-left shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-50 dark:border-stone-800/60 pb-3">
                      <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-stone-800 text-[#1B4332] dark:text-emerald-400">
                        <HelpCircle className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-extrabold text-xs text-[#1B4332] dark:text-emerald-400 uppercase tracking-tight">FAQ / Tanya Jawab Prosedur</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Informasi instan mengenai kendala administratif dan pengurusan izin.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          q: "Bagaimana cara melakukan pengajuan perizinan baru?",
                          a: "Pilih menu 'Layanan', klik tombol 'Ajukan Permohonan' pada kategori yang sesuai (AMDAL, UKL-UPL, SPPL), isi formulir dinamis secara lengkap serta lampirkan berkas pendukung, dan klik tombol Kirim. Anda akan memperoleh Kode Lacak Berkas secara instan."
                        },
                        {
                          q: "Berapa lama estimasi pengerjaan verifikasi berkas oleh petugas?",
                          a: "Estimasi proses pengerjaan verifikasi kelengkapan berkas standard membutuhkan waktu 3 s.d 7 hari kerja sejak data berstatus 'Dikirim'. Anda dapat mengecek status perkembangan langsung di tab Lacak."
                        },
                        {
                          q: "Apakah layanan perizinan di SobatHijau berbayar?",
                          a: "Tidak ada biaya sama sekali. Seluruh proses pendaftaran, peninjauan berkas, hingga pencetakan dokumen keputusan diselenggarakan 100% GRATIS (tidak ada biaya administratif/retribusi) dari DLH Kota Pontianak."
                        },
                        {
                          q: "Bagaimana bila berkas saya ditolak/berstatus perlu revisi?",
                          a: "Bila status berkas adalah 'Ditolak' atau 'Perlu Revisi', silakan buka menu Lacak Berkas untuk meninjau log evaluasi kritis dari verifikator kami. Anda dapat menginput perbaikan berkas di sana tanpa mendaftar ulang koordinat baru."
                        },
                        {
                          q: "Bagaimana cara kerja fitur Asisten Cerdas di website ini?",
                          a: "Asisten Cerdas kami terintegrasi dengan kecerdasan buatan (Gemini AI). Fitur ini telah mempelajari standar regulasi AMDAL & UU Cipta Kerja bidang Lingkungan Hidup Pontianak untuk membantu memberikan umpan balik kelayakan draf dokumen Anda secara langsung."
                        }
                      ].map((faq, index) => {
                        const isOpen = openFaq === index;
                        return (
                          <div key={index} className="border border-slate-100 dark:border-stone-850/60 rounded-xl overflow-hidden transition-colors duration-300">
                            <button
                              onClick={() => {
                                const nextState = isOpen ? null : index;
                                setOpenFaq(nextState);
                                if (nextState !== null) {
                                  speakText(`Pertanyaan: ${faq.q}`);
                                }
                              }}
                              className="w-full px-4 py-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-700 hover:text-emerald-800 dark:text-stone-200 dark:hover:text-emerald-400 bg-slate-50/50 hover:bg-emerald-50/10 dark:bg-stone-850/20 dark:hover:bg-stone-850/40 transition gap-4"
                            >
                              <span>{faq.q}</span>
                              {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 transition text-emerald-600 dark:text-emerald-400" /> : <ChevronDown className="w-4 h-4 shrink-0 transition text-slate-400" />}
                            </button>
                            
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2, ease: "easeInOut" }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 py-3.5 text-[10.5px] leading-relaxed text-slate-500 dark:text-stone-300 bg-white dark:bg-stone-900 border-t border-slate-100 dark:border-stone-855">
                                    {faq.a}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 2. DYNAMIC LAYANAN & PERMOHONAN TAB */}
            {activeTab === 'layanan' && (
              <div className="space-y-4 animate-fade-in text-slate-900 dark:text-stone-100" id="services-view-tab">
                <div className="text-left pb-2">
                  <h3 className="text-lg font-black tracking-tight text-[#1B4332] dark:text-emerald-400" id="services-header-title">Daftar Layanan Publik DLH</h3>
                  <p className="text-xs text-slate-500">Silakan pilih jenis pelayanan di bawah ini untuk mengisi formulir permohonan secara online.</p>
                </div>
                
                <LayananKami 
                  services={services} 
                  onSubmitForm={(service, data) => {
                    handleSubmitForm(service, data);
                  }}
                  onSpeak={speakText}
                />
              </div>
            )}

            {/* 3. LACAK PERMOHONAN TAB */}
            {activeTab === 'lacak' && (
              <div className="space-y-4 animate-fade-in" id="tracking-view-tab">
                <div className="text-left pb-2">
                  <h3 className="text-lg font-black tracking-tight text-[#1B4332] dark:text-emerald-400" id="tracking-header-title">Pelacakan Berkas Digital</h3>
                  <p className="text-xs text-slate-500">Gunakan fitur ini untuk mengetahui secara transparan tahapan pekerjaan, penugasan teknis lapangan, hingga naskah surat keputusan dikeluarkan.</p>
                </div>

                <TrackingSobat 
                  submissions={submissions} 
                  initialSearchCode={trackSearchCode}
                  onSpeak={speakText}
                />
              </div>
            )}

            {/* 4. INTERACTIVE CHAT AI ASSISTANT TAB */}
            {activeTab === 'asisten' && (
              <div className="max-w-2xl mx-auto space-y-4 animate-fade-in" id="assistant-view-tab">
                <div className="text-left pb-1">
                  <h3 className="text-lg font-black tracking-tight text-[#1B4332] dark:text-emerald-400" id="assistant-header-title">Konsultasi Terpadu Cerdas</h3>
                  <p className="text-xs text-slate-500">Tanyakan apapun seputar aturan, denda, izin SPPL, masa berlaku uji laboratorium air bersih, atau pengambilan bibit pohon rindang.</p>
                </div>

                <AsistenHijau 
                  ttsEnabled={accessibility.textToSpeech} 
                  onSpeak={speakText}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER COPYRIGHT & IDENTITY BRAND */}
      <footer className="bg-white dark:bg-stone-900 border-t border-emerald-100 dark:border-stone-800 py-6 px-8 mt-12 transition-colors duration-300 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#1B4332] dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F]"></span>
              <span className="font-bold tracking-wide">Sobat Hijau DLH Kota Pontianak</span>
            </div>
            <p className="text-gray-400 dark:text-stone-500 max-w-sm leading-relaxed text-[11px]">
              Inovasi sistem perizinan mandiri & pengawasan lingkungan berkelanjutan. Terinspirasi dari portal Dinas Lingkungan Hidup Kota Pontianak.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-[11px] text-gray-500">
            <a href="#about" onClick={(e) => { e.preventDefault(); changeTab('beranda'); }} className="hover:text-[#1B4332] dark:hover:text-emerald-400 font-semibold transition">Hubungi Pengawas</a>
            <span className="text-slate-200 hidden sm:inline">|</span>
            <a href="#about" onClick={(e) => { e.preventDefault(); changeTab('asisten'); }} className="hover:text-[#1B4332] dark:hover:text-emerald-400 font-semibold transition">Edukasi UU Lingkungan</a>
            <span className="text-slate-200 hidden sm:inline">|</span>
            <p className="text-gray-400 dark:text-stone-500">© 2026 Dinas Lingkungan Hidup. Semua Hak Dilindungi.</p>
          </div>

        </div>
      </footer>

        </div>
      )}
    </div>
  );
}
