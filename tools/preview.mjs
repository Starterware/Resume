import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { basePath, startStaticServer } from './static-server.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { port } = await startStaticServer(join(repoRoot, 'dist/resume/browser'), 4300);

console.log(
  `Serving the built site exactly as GitHub Pages would, on http://127.0.0.1:${port}${basePath}/`,
);
