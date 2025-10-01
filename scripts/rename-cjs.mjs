import { readdir, rename, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(p);
    } else if (entry.isFile() && extname(entry.name) === '.js') {
      await rename(p, p.replace(/\.js$/i, '.cjs'));
    }
  }
}

try {
  await stat('dist/cjs');
  await walk('dist/cjs');
  console.log('[rename-cjs] Converted .js -> .cjs in dist/cjs');
} catch (err) {
  console.error('[rename-cjs] Skipped:', err?.message || err);
  process.exit(0);
}

