import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Deutsch — nauka do poprawki',
    short_name: 'Deutsch',
    description: 'Lekcje, ćwiczenia, testy i fiszki z niemieckiego A1.2.',
    start_url: '/study/',
    display: 'standalone',
    background_color: '#f7f5ef',
    theme_color: '#111827',
    lang: 'pl',
    icons: [
      {
        src: '/icon.png',
        sizes: '128x128',
        type: 'image/png',
      },
    ],
  };
}
