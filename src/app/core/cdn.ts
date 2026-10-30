import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

// ── CDN de assets estáticos (Cloudinary) ────────────────────────────────────
// Los archivos de `public/` no llevan hash en el nombre, así que el navegador y
// el CDN seguían sirviendo la versión antigua tras cada deploy. Servirlos desde
// Cloudinary desacopla el contenido del build de Docker, y `f_auto,q_auto` deja
// que el CDN elija el mejor formato (WebP/AVIF) y compresión sin deformar.
const TRANSFORMS = 'f_auto,q_auto';

/** `/images/boutique/product-8-v2.png` → `boutique/product-8-v2.png` */
function toPublicId(localPath: string): string {
  return localPath.replace(/^\//, '').replace(/^(assets\/)?images\//, '');
}

/**
 * Resuelve una ruta local al asset público del CDN.
 * Devuelve el valor original si el CDN no está configurado o si la ruta ya es
 * absoluta (ej. las imágenes de Unsplash), de modo que la llamada es idempotente.
 */
export function cdnUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  const cloudName = environment.cloudinaryCloudName;
  if (!cloudName) return path;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${TRANSFORMS}/${toPublicId(path)}`;
}

/** Versión para plantillas: `[src]="'/images/...' | cdn"` */
@Pipe({ name: 'cdn', standalone: true })
export class CdnPipe implements PipeTransform {
  transform(path: string | null | undefined): string {
    return cdnUrl(path);
  }
}
