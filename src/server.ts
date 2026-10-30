import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

// Confiar en los encabezados de proxy inverso (Nginx, Traefik, Cloudflare, etc.)
app.set('trust proxy', true);

const allowedHosts = process.env['ALLOWED_HOSTS']
  ? process.env['ALLOWED_HOSTS'].split(',').map((h) => h.trim())
  : ['samts.app', 'www.samts.app', 'localhost', '127.0.0.1'];

const angularApp = new AngularNodeAppEngine({
  trustProxyHeaders: true,
  allowedHosts,
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    etag: true,
    lastModified: true,
    maxAge: 0,
    setHeaders: (res, path) => {
      // Los bundles que genera Angular llevan hash en el nombre (main-ABCD1234.js),
      // esos pueden cachearse de forma indefinida. El contenido copiado tal cual
      // desde `public/` (imágenes, videos) NO lleva hash, así que debe revalidarse
      // siempre para que un redeploy no siga sirviendo la versión antigua.
      const hashedBundle = /-[A-Za-z0-9_-]{8,}\.(js|css|woff2?|ttf)$/.test(path);
      res.setHeader(
        'Cache-Control',
        hashedBundle
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=0, must-revalidate',
      );
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
