import type { MetadataRoute } from 'next';
import { canonicalOrigin } from '@/lib/seo';
export default function sitemap(): MetadataRoute.Sitemap {
  // Draft policy pages remain noindex until reviewed; only publish canonical content.
  return [{ url: canonicalOrigin() + '/', changeFrequency: 'monthly', priority: 1 }];
}
