# Context Recovery — LR XMLParser (LuciformResearch)

This document captures the current state, decisions, and the next actionable steps so a future Codex session can resume seamlessly.

## Snapshot (as of v0.2.0 → v0.2.1 work-in-progress)

- Package: `@luciformresearch/xmlparser`
- Latest published: v0.2.0 (0.1.7 → 0.1.8 → 0.1.9 → 0.2.0 shipped today)
- Repo features now in place:
  - Dual ESM/CJS builds + exports map; subpaths: `./scanner`, `./document`, `./diagnostics`, `./types`, `./migration`, `./sax`.
  - Namespaces (phase 1 + 2): `xmlns`/`xmlns:prefix` mapping per element frame; diagnostics for unbound prefix and reserved prefixes; BAD_QNAME; ns-aware helpers: `findByNS`/`findAllByNS` on `Document`/`Element`.
  - DOCTYPE fidelity: root name + PUBLIC/SYSTEM extracted.
  - Attribute safeguards: duplicates surfaced; maxAttrCount and maxAttrValueLength enforced; scanner-level diagnostics `ATTR_MISSING_SPACE`, `ATTR_NO_VALUE`.
  - Recovery controls: `ParserOptions.maxRecoveries?`; parse result includes `recoveryReport { attempts, capped }`.
  - SAX/streaming: minimal `LuciformSAX` in `sax.ts` exported as `@luciformresearch/xmlparser/sax`.
  - Docs: README EN/FR with Getting started at top, Edge cases (incl. namespaces), Error handling, ns-aware example, SAX usage; `docs/LLM_XML.md`, `docs/Security_XML.md`, `docs/IMPROVEMENTS.md`.
  - CI: GitHub Actions (matrix 18/20/22: build/lint/test/audit), GitLab CI (build/test/publish on tag), npm provenance in release.
  - Tests: vitest; 18/18 passing on local runs; includes namespaces, attributes, edge cases.
  - Tooling: ESLint v9 flat config, Prettier, EditorConfig; strict lint rules passing.

## Notable implementation details

- ESM build compatibility: we compile with `moduleResolution: Bundler` and post-process ESM imports via `scripts/fix-esm-extensions.mjs` to add `.js` extensions so Node ESM resolves correctly.
- CJS build uses nested `dist/cjs/package.json` `{ type: 'commonjs' }` to avoid renaming to `.cjs`.
- Exports map declares both import (ESM) and require (CJS) entries for root and subpaths; types exposed from `dist/types`.
- Namespaces: attributes `xmlns`/`xmlns:*` are not exposed in `element.attributes` (they are stored in `element.namespaces`). Default ns applies to elements, not attributes.
- Recovery: `DiagnosticManager` tracks `recoveryCount` and a simple `recoveryCap`; current parser still records all diagnostics even if cap exceeded; behavioral cut-offs not enforced yet (see Next Steps).

## Files changed/added (key ones)

- `index.ts`: DOCTYPE parsing, namespaces, attribute limits, recovery cap wiring.
- `scanner.ts`: attribute scanning returns `duplicateAttributes`, `invalidAttributes`; detects missing space and missing/invalid values.
- `document.ts`: ns-aware helpers (`getResolvedName`, `findByNS`, `findAllByNS`).
- `sax.ts`: `LuciformSAX` minimal event-driven iterator.
- `README.md`, `README.fr.md`: Getting started at top; ns-aware + SAX sections; Error handling.
- `docs/LLM_XML.md`, `docs/Security_XML.md`, `docs/IMPROVEMENTS.md`.
- `CHANGELOG.md`, `SECURITY.md`.
- `tests/*.spec.ts`: namespaces, attributes, edge cases, permissive recovery.
- `lr_tools/` copied (git-ignored) and `Reports/` added to `.gitignore`; reports generated under `Reports/`.

## Reports generated (via lr_tools)

- Roadmap: `Reports/Research/LR_XMLParser__Improvement_Roadmap_...md` (filled with context/objectives/plan).
- Milestones (Plans):
  - `Reports/Plans/M1__Namespaces__DOCTYPE__Attributes_...md`
  - `Reports/Plans/M2__Recovery_Policy__Limits_Hardening_...md`
  - `Reports/Plans/M3__SAX_Streaming__Benchmarks_...md`

`lr_tools` was copied from `~/lr_hmm/lr_tools` and is ignored — but usable locally to generate further reports: `./lr_tools/bin/new_report`.

## Environments & escalations

- This session used network & filesystem escalations for:
  - Reading `~/lr_hmm` and `~/lr_chat` for context.
  - `npm install`/`npm publish` (network), pushing git tags (SSH/network).
- For future sessions, expect to request approval for any out-of-workspace reads, network ops (publish), and remote pushes.
- NPM publishing requires NPM auth (NPM_TOKEN for CI or `npm login` locally). GitHub/GitLab release jobs need `NPM_TOKEN` secret.

## How to build/test/publish locally

- Install dev deps: `npm ci` (or `npm i`)
- Lint: `npm run lint`
- Tests: `npm run test`
- Build: `npm run build`
- Publish (scoped, public): `npm publish --access public`
- Tag & push:
  - `git tag vX.Y.Z`
  - `git push -u origin "$(git rev-parse --abbrev-ref HEAD)" --follow-tags`
  - `git push github --follow-tags`

## What remains (recommended next steps)

- Namespaces (phase 3)
  - README: add a short table summarizing default ns behavior and attribute rules; add an ns-aware example with multiple frames.
  - Optional: cache resolved ns on nodes for faster matching; add more unit tests (default ns inheritance corner cases; attributes with prefixes/no-prefix in default ns).
- Recovery policy
  - Behavior: when `maxRecoveries` exceeded, choose a consistent strategy (e.g., downgrade further diagnostics to info, stop adding children beyond cap, or stop scanning children and add a final `RECOVERY_ATTEMPTED` summary). Document in README.
  - Expose `recoveryReport` details (e.g., categories of recovered issues) if valuable.
- SAX/Streaming (M3)
  - Add minimal unit tests for `LuciformSAX`.
  - Optional: add a backpressure-friendly iterator form.
- Benchmarks
  - Add `scripts/bench/*.ts` with a few corpus samples (LLM outputs with comments/CDATA; attributes heavy; deep nesting; namespace-heavy); write a small `docs/BENCHMARKS.md`.
- Attribute validation (phase 2)
  - Consider decoding entities in attributes during scan or keep in parser (document current choice; today decode happens in parser path for doc nodes; scanner leaves raw values).
  - Add diagnostic for forbidden `<` in decoded attribute values (already handled in parser; expand tests).

## Known caveats / compatibility

- ESM build is post-processed to add `.js` import suffixes (NodeNext-style). If the project transitions to authoring with explicit `.js` extensions and `moduleResolution: NodeNext`, the patch script can be dropped.
- CJS output uses `dist/cjs/package.json { type: 'commonjs' }`; ensure exports map always points to `.js` in `dist/cjs`.
- `findElement(name)` remains name-based; ns-aware alternatives are provided (no breaking change).

## Useful references

- Current repo: lr_xmlparser
- Related repos (context):
  - `~/lr_hmm` (where XML engine is used; tool `lr_tools` copied from here)
  - `~/lr_chat` (older pre-refactor parser; namespaces logic reviewed)
- NPM: https://www.npmjs.com/package/@luciformresearch/xmlparser
- GitLab: https://gitlab.com/luciformresearch/lr_xmlparser
- GitHub: https://github.com/LuciformResearch/LR_XMLParser

## TL;DR handoff

- Codebase is lint/format clean; tests are green; v0.2.0 published (SAX + recovery report + ns docs). `v0.1.7–0.1.9` covered namespaces, DOCTYPE fidelity, attr limits/diagnostics.
- Next: improve namespaces docs/tests, implement behavioral cap for recovery, add SAX tests, and add basic benchmarks. Publish as v0.2.1 when ready and tag; CI should run automatically on GitHub/GitLab if secrets are present.

