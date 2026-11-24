import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LabSync 연구실 운영 요청', short_name: 'LabSync',
    description: '연구실 Google Calendar 운영 요청 관리',
    lang: 'ko', start_url: '/', display: 'standalone',
    background_color: '#faf9ff', theme_color: '#332676',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
