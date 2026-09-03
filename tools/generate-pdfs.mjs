import { mkdir, copyFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { startStaticServer } from './static-server.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browserDist = join(repoRoot, 'dist/resume/browser');
const languages = ['en', 'fr', 'nl'];

/**
 * Renders the /print route of each locale to a PDF.
 *
 * This runs after the build, against the real prerendered output, so the PDF
 * and the website can never drift apart: both are produced from the same JSON
 * by the same components. Editing the data and pushing regenerates all three.
 */
async function main() {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error('Playwright is not installed. Run: npm install');
    process.exit(1);
  }

  const outputDir = join(browserDist, 'pdf');
  await mkdir(outputDir, { recursive: true });

  const { server, port } = await startStaticServer(browserDist);
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    // The print sheet is designed for light paper; forcing the colour scheme
    // stops a dark-mode CI runner from producing a dark PDF.
    await page.emulateMedia({ colorScheme: 'light' });

    for (const lang of languages) {
      const url = `http://127.0.0.1:${port}/${lang}/print`;
      const response = await page.goto(url, { waitUntil: 'networkidle' });

      if (!response?.ok()) {
        throw new Error(`${url} returned ${response?.status()} — was the site built first?`);
      }

      const target = join(outputDir, `cv-${lang}.pdf`);
      await page.pdf({
        path: target,
        format: 'A4',
        printBackground: true,
        // Margins live in the print stylesheet so the layout owns its geometry.
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });
      console.log(`  ✔ pdf/cv-${lang}.pdf`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  // Mirror into public/ so `ng serve` can serve the download link locally.
  const publicPdf = join(repoRoot, 'public/pdf');
  await mkdir(publicPdf, { recursive: true });
  for (const file of await readdir(outputDir)) {
    await copyFile(join(outputDir, file), join(publicPdf, file));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
