import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { defaultServices, defaultSubmissions } from './src/data/defaultServices.js';
import { defaultLocations } from './src/data/defaultLocations.js';
import { defaultCategories } from './src/data/defaultCategories.js';
import { updateTimeline, nowSql, STATUS_LABELS } from './src/lib/timeline.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'sobat-hijau.sqlite');
const db = await open({ filename: DB_PATH, driver: sqlite3.Database, mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE });
await db.run('PRAGMA journal_mode=WAL');
await db.run('PRAGMA synchronous=NORMAL');

await db.exec(`
CREATE TABLE IF NOT EXISTS services (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS activity_logs (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS locations (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS network_links (id TEXT PRIMARY KEY, data TEXT NOT NULL);
`);

const seed = async (table: string, rows: any[]) => {
  const { count } = await db.get<{ count: number }>(`SELECT COUNT(*) count FROM ${table}`) || { count: 0 };
  if (!count) for (const row of rows) await db.run(`INSERT INTO ${table} (id,data) VALUES (?,?)`, row.id, JSON.stringify(row));
};

await seed('services', defaultServices);
await seed('submissions', defaultSubmissions);
await seed('locations', defaultLocations);
await seed('categories', defaultCategories);
await seed('network_links', [
  { id: 'link-1', title: 'Portal Resmi DLH Kota Pontianak', url: 'https://dlh.pontianakkota.go.id', description: 'Website resmi Dinas Lingkungan Hidup Kota Pontianak', sortOrder: 1, isActive: true },
  { id: 'link-2', title: 'Sistem Informasi Pengelolaan Sampah', url: 'https://sips.dlh.pontianakkota.go.id', description: 'Portal data dan monitoring pengelolaan sampah Kota Pontianak', sortOrder: 2, isActive: true },
  { id: 'link-3', title: 'Informasi Indeks Kualitas Lingkungan Hidup', url: 'https://iklh.menlhk.go.id', description: 'Data IKLH nasional dari Kementerian Lingkungan Hidup', sortOrder: 3, isActive: true },
  { id: 'link-4', title: 'Lapor Pengaduan Lingkungan Hidup', url: 'https://pengaduan.dlh.pontianakkota.go.id', description: 'Saluran aduan masyarakat seputar lingkungan hidup', sortOrder: 4, isActive: true },
  { id: 'link-5', title: 'Sobat Hijau - Portal Pelayanan', url: 'https://sobat.dst.my.id', description: 'Portal pelayanan online terpadu DLH Kota Pontianak', sortOrder: 5, isActive: true },
]);
await seed('notifications', [
  { id: 'notif-1', submissionId: 'SH-2026-08123', applicantName: 'PT. Pontianak Tirta Agung', serviceName: 'Pengujian Sampah / Air / Udara Laboratorium', newStatus: 'SURVEY_TEKNIS', message: 'Status permohonan Laboratorium (SH-2026-08123) milik PT. Pontianak Tirta Agung diperbarui oleh Admin menjadi SURVEY TEKNIS.', timestamp: '2026-06-01 09:12', isRead: false },
  { id: 'notif-2', submissionId: 'SH-2026-04981', applicantName: 'Bapak Ahmad Subardjo', serviceName: 'Izin Rekomendasi Upaya Pemantauan Lingkungan Hidup (UKL-UPL)', newStatus: 'SELESAI', message: 'Selamat! Dokumen Kelayakan UKL-UPL (SH-2026-04981) atas nama Bapak Ahmad Subardjo telah SELESAI diterbitkan dan siap diunduh.', timestamp: '2026-06-02 07:45', isRead: false }
]);
await seed('activity_logs', [
  { id: 'log-1', action: 'Login berhasil sebagai Administrator DLH Pontianak', timestamp: '2026-06-03 12:44', iconType: 'success' },
  { id: 'log-2', action: 'Memverifikasi kelayakan teknis berkas PT. Pontianak Tirta Agung', timestamp: '2026-06-03 11:20', iconType: 'info' },
  { id: 'log-3', action: 'Menerbitkan rekomendasi kelayakan UKL-UPL Bapak Ahmad Subardjo', timestamp: '2026-06-03 09:12', iconType: 'success' },
  { id: 'log-4', action: 'Memperbarui koordinat sebaran TPS 3R di peta lingkungan', timestamp: '2026-06-02 16:30', iconType: 'info' },
  { id: 'log-5', action: 'Menambahkan kuesioner baru untuk layanan Pengujian Kebisingan', timestamp: '2026-06-02 14:15', iconType: 'success' }
]);

const all = async (table: string) => (await db.all<{ data: string }[]>(`SELECT data FROM ${table}`)).map(r => JSON.parse(r.data));
const put = (table: string, row: any) => db.run(`INSERT OR REPLACE INTO ${table} (id,data) VALUES (?,?)`, row.id, JSON.stringify(row));

const app = express();
app.use(express.json({ limit: '2mb' }));
app.get('/api/bootstrap', async (_, res) => res.json({ services: await all('services'), submissions: await all('submissions'), notifications: await all('notifications'), activityLogs: await all('activity_logs'), locations: await all('locations'), categories: await all('categories'), networkLinks: await all('network_links') }));
app.post('/api/services', async (req, res) => { await put('services', req.body); res.json(req.body); });
app.put('/api/services/:id', async (req, res) => { await put('services', req.body); res.json(req.body); });
app.delete('/api/services/:id', async (req, res) => { await db.run('DELETE FROM services WHERE id=?', req.params.id); res.json({ ok: true }); });
app.post('/api/submissions', async (req, res) => { await put('submissions', req.body); res.json(req.body); });
app.put('/api/submissions/:id/status', async (req, res) => {
  const row = await db.get<{ data: string }>('SELECT data FROM submissions WHERE id=?', req.params.id);
  if (!row) return res.status(404).send('submission not found');
  const sub = JSON.parse(row.data), date = nowSql(), status = req.body.status, adminNote = req.body.adminNote;
  sub.status = status; sub.timeline = updateTimeline(sub.timeline, status, adminNote, date); await put('submissions', sub);
  const message = status === 'DITOLAK' ? `Permohonan ${sub.serviceName} (${sub.id}) ditolak: "${adminNote || 'Syarat berkas tidak terpenuhi'}"` : `Status berkas ${sub.serviceName} (${sub.id}) diperbarui menjadi [${STATUS_LABELS[status]}].`;
  const notification = { id: `notif-${Math.random().toString(36).slice(2, 9)}`, submissionId: sub.id, applicantName: sub.applicantName, serviceName: sub.serviceName, newStatus: status, message, timestamp: date, isRead: false };
  await put('notifications', notification); res.json({ submission: sub, notification });
});
app.delete('/api/submissions/:id', async (req, res) => { await db.run('DELETE FROM submissions WHERE id=?', req.params.id); res.json({ ok: true }); });
app.put('/api/notifications/read-all', async (_, res) => {
  try {
    const rows = (await all('notifications')).map(n => ({ ...n, isRead: true }));
    for (const n of rows) await put('notifications', n);
    res.json(rows);
  } catch (e: any) {
    console.error('read-all error:', e.message);
    res.status(500).json({ error: e.message });
  }
});
app.put('/api/notifications/:id/read', async (req, res) => { const row = await db.get<{ data: string }>('SELECT data FROM notifications WHERE id=?', req.params.id); if (!row) return res.status(404).send('notification not found'); const n = { ...JSON.parse(row.data), isRead: true }; await put('notifications', n); res.json(n); });
app.delete('/api/notifications', async (_, res) => { await db.run('DELETE FROM notifications'); res.json({ ok: true }); });

app.get('/api/locations', async (_, res) => res.json(await all('locations')));
app.post('/api/locations', async (req, res) => { await put('locations', req.body); res.json(req.body); });
app.put('/api/locations/:id', async (req, res) => { await put('locations', req.body); res.json(req.body); });
app.delete('/api/locations/:id', async (req, res) => { await db.run('DELETE FROM locations WHERE id=?', req.params.id); res.json({ ok: true }); });

app.get('/api/categories', async (_, res) => res.json(await all('categories')));
app.post('/api/categories', async (req, res) => { await put('categories', req.body); res.json(req.body); });
app.put('/api/categories/:id', async (req, res) => { await put('categories', req.body); res.json(req.body); });
app.delete('/api/categories/:id', async (req, res) => { await db.run('DELETE FROM categories WHERE id=?', req.params.id); res.json({ ok: true }); });

app.get('/api/network-links', async (_, res) => res.json(await all('network_links')));
app.post('/api/network-links', async (req, res) => { await put('network_links', req.body); res.json(req.body); });
app.put('/api/network-links/:id', async (req, res) => { await put('network_links', req.body); res.json(req.body); });
app.delete('/api/network-links/:id', async (req, res) => { await db.run('DELETE FROM network_links WHERE id=?', req.params.id); res.json({ ok: true }); });

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));
app.listen(Number(process.env.PORT) || 3000, () => console.log('Sobat Hijau SQLite server ready'));
