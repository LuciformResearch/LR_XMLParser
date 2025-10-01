import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadParser() {
  // Use built ESM output to avoid TS runners
  const mod = await import(pathToFileURL(join(process.cwd(), 'dist/esm/index.js')).href);
  return mod.LuciformXMLParser;
}

function nsDoc() {
  return '<root xmlns="urn:d" xmlns:f="urn:f">' +
    '<item a="1" f:aa="2"><f:b>t</f:b><c/><d/></item>'.repeat(10) +
    '</root>';
}

function smallDoc() {
  return '<r>' + '<a x="1">t</a>'.repeat(20) + '</r>';
}

function malformedDoc() {
  return '<root><a x="1" x="1"><b></root>'; // dup attr + mismatched
}

function hrtimeMs(start, end) {
  return Number(end - start) / 1e6;
}

async function runCase(name, xml, iterations, Parser) {
  global.gc && global.gc();
  const memBefore = process.memoryUsage();
  const start = process.hrtime.bigint();
  let success = 0;
  for (let i = 0; i < iterations; i++) {
    const res = new Parser(xml, { mode: 'luciform-permissive' }).parse();
    if (res.success) success++;
  }
  const end = process.hrtime.bigint();
  const ms = hrtimeMs(start, end);
  const avg = ms / iterations;
  const tps = (iterations * 1000) / ms;
  global.gc && global.gc();
  const memAfter = process.memoryUsage();
  const memDelta = {
    rss: memAfter.rss - memBefore.rss,
    heapUsed: memAfter.heapUsed - memBefore.heapUsed,
    external: memAfter.external - memBefore.external,
  };
  console.log(
    `[bench] ${name}: ${iterations} iters in ${ms.toFixed(1)}ms | avg ${avg.toFixed(3)}ms | ${tps.toFixed(1)} docs/s | success ${success}/${iterations} | heapΔ ${(memDelta.heapUsed/1024).toFixed(1)} KiB`
  );
  return { name, iterations, ms, avgMs: avg, docsPerSec: tps, success, memDelta };
}

async function main() {
  const Parser = await loadParser();
  const iterations = Number(process.env.BENCH_ITERS || 2000);
  console.log(`[bench] Using dist/esm/index.js, iterations=${iterations}${global.gc ? ' (GC enabled)' : ''}`);
  const results = [];
  results.push(await runCase('small-valid', smallDoc(), iterations, Parser));
  results.push(await runCase('malformed-recovery', malformedDoc(), iterations, Parser));
  results.push(await runCase('namespaces-heavy', nsDoc(), iterations, Parser));
  // Persist JSON report
  try {
    const { mkdir, writeFile } = await import('node:fs/promises');
    const dir = 'Reports/Benchmarks';
    await mkdir(dir, { recursive: true });
    const pkgJson = JSON.parse(await (await import('node:fs/promises')).readFile(join(process.cwd(), 'package.json'), 'utf8'));
    const meta = {
      date: new Date().toISOString(),
      node: process.version,
      pkg: pkgJson.version,
    };
    const out = { meta, results };
    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '_')
      .replace('T', '__')
      .replace('Z', 'Z');
    const fp = join(dir, `bench_${stamp}.json`);
    await writeFile(fp, JSON.stringify(out, null, 2));
    console.log(`[bench] wrote ${fp}`);
  } catch (e) {
    console.warn('[bench] failed to write JSON report:', e?.message || e);
  }
}

main().catch((e) => {
  console.error('[bench] error:', e?.stack || e);
  process.exit(1);
});
