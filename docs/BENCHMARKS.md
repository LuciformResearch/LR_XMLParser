# Benchmarks — LR XMLParser

This document describes how to run basic, reproducible local benchmarks for LR XMLParser.

## Goals

- Compare performance across typical inputs: small valid XML, malformed LLM XML, namespace‑heavy documents.
- Track parser throughput (docs/sec) and latency (ms/doc) for fixed iteration counts.
- Ensure runs are stable and simple to reproduce locally.

## How to run

1) Build the project (ensures `dist/` is present):

```bash
npm run build
```

2) Run the basic benchmark script:

```bash
npm run bench
```

The script uses the compiled ESM entry (`dist/esm/index.js`) and prints simple statistics.

## Methodology

- Each corpus sample is parsed repeatedly (e.g., N = 2_000 iterations) using `LuciformXMLParser`.
- We measure wall time using `process.hrtime.bigint()` and compute throughput and average latency.
- We run three categories by default:
  - Small valid document
  - Malformed document with recoveries (permissive mode)
  - Namespace‑heavy document

## Future extensions

- Add larger files (100KB–1MB) and streaming/SAX benchmarks once `LuciformSAX` tests exist.
- Track memory usage (`process.memoryUsage()`) before/after runs.
- Export JSON results to `Reports/Benchmarks/` for historical comparison.

