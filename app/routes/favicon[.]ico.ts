import type { LoaderFunctionArgs } from '@vercel/remix';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Cache for 1 year (immutable static asset)
const ONE_YEAR_IN_SECONDS = 31536000;

/**
 * Resource route to serve the favicon.ico file
 * This ensures the favicon is always accessible even if static file serving
 * has issues in certain deployment environments
 */
export const loader = async ({ request: _request }: LoaderFunctionArgs) => {
  try {
    // Read the favicon file from the public directory
    const faviconPath = join(globalThis.process.cwd(), 'public', 'favicon.ico');
    const favicon = await readFile(faviconPath);

    return new Response(favicon, {
      status: 200,
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': `public, max-age=${ONE_YEAR_IN_SECONDS}, immutable`,
      },
    });
  } catch (error) {
    console.error('Error serving favicon:', error);
    // Return 404 instead of 502 to be more explicit about the issue
    return new Response('Favicon not found', { status: 404 });
  }
};
