# Sobat Hijau - DLH Kota Pontianak

Sistem Pelayanan Online Terpadu Dinas Lingkungan Hidup Kota Pontianak.

## Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS 4 + Zustand + Framer Motion
- **Backend:** Laravel 13 (FrankenPHP worker mode)
- **Database:** SQLite (WAL mode)
- **Server:** FrankenPHP v1.12.4 (PHP 8.5.7, Caddy v2.11.4)
- **Hosting:** Armbian aarch64 (1.8GB RAM, 4 core ARMv8)

## Development

```bash
npm install
npm run dev
```

Starts Vite dev server on port 5173 and Express dev server on port 4000.

## Production

Frontend build + Laravel serve via FrankenPHP:

```bash
npm run build
cp -r dist/assets /home/storage/laravel-app/public/
cp dist/index.html /home/storage/laravel-app/public/app.html
```

Cloudflare tunnel: `sobat.dst.my.id` → `localhost:3000` (FrankenPHP)

## Structure

```
src/
  App.tsx              # Main app with pathname-based routing
  components/          # UI components (AdminPanel, TrackingSobat, FormCreator, etc.)
  layouts/             # AdminLayout, AdminSidebar, PublicHeader, PublicFooter
  store/               # Zustand store (useStore.ts)
  lib/                 # API client, timeline utils
  types.ts             # TypeScript types
laravel-app/
  app/Http/Controllers/Api/  # API controllers
  app/Models/                 # Eloquent models
  routes/api.php              # API routes
  routes/web.php              # SPA catch-all for valid paths
  worker.php                  # FrankenPHP worker entry
```

## API Endpoints

```
GET  /api/bootstrap          → services, submissions, notifications, activityLogs
POST /api/services           → create service
PUT  /api/services/{id}      → update service
DEL  /api/services/{id}      → delete service
POST /api/submissions        → create submission
PUT  /api/submissions/{id}/status → update submission status
DEL  /api/submissions/{id}   → delete submission
PUT  /api/notifications/read-all → mark all read
PUT  /api/notifications/{id}/read → mark one read
DEL  /api/notifications      → clear all notifications
```

## License

Apache 2.0
