import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ScoutHub — Manajemen Gudep',
    short_name: 'ScoutHub',
    description: 'Kelola anggota, regu, latihan, absensi, SKU, dan laporan gudep.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#07100c',
    theme_color: '#10b981',
    lang: 'id-ID',
    icons: [
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
  }
}
