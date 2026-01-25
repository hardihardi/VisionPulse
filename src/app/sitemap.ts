
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://visionpulse.firebaseapp.com'; // Ganti dengan URL produksi Anda

  const routes = [
    '/',
    '/history',
    '/plate-search',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  return routes;
}
