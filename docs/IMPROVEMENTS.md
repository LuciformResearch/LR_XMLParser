# LR XMLParser — Improvement Ideas

This document outlines prioritized enhancements to increase robustness, standards coverage, and developer ergonomics.

## 1) XML Namespaces (xmlns)
- Add parsing of `xmlns` and `xmlns:prefix` declarations into element namespace maps.
- Support qualified names `prefix:local` with resolution to a namespace URI.
- Provide helpers on `XMLElement`/`XMLDocument` to query by `{namespace, localName}`.
- Validation: undefined prefix → diagnostic `UNDEFINED_PREFIX`; invalid namespace → `INVALID_NAMESPACE`.

## 2) DOCTYPE parsing fidelity
- Extract root name, PUBLIC/SYSTEM ids from `<!DOCTYPE ...>` correctly.
- Preserve internal subset content for analysis (optionally disabled in secure mode).
- Diagnostics: malformed DOCTYPE → `INVALID_DOCTYPE` with location and suggestions.

## 3) Attribute validation and limits
- Enforce `maxAttrCount` per element.
- Enforce `maxAttrValueLength` per attribute value.
- Detect duplicate attributes → `DUPLICATE_ATTRIBUTE`.
- Handle unquoted/partial values in permissive mode with recovery notes.

## 4) Processing instruction (PI) model
- Parse PI into `{ target, data }` instead of raw content.
- Limit checks on `data` length via `maxPILength`.
- Diagnostics: unclosed PI → `INVALID_PI`.

## 5) Recovery heuristics (permissive)
- Configurable recovery policy (e.g., `autocloseMissingEndTags: boolean`).
- Cap number of recoveries per document (`maxRecoveries`) to avoid silent over-recovery.
- Explicit recovery report (
  `{ attempts, applied: [...], notes }`) in the result.

## 6) Streaming/SAX interface (optional module)
- Expose a light event-driven API for large inputs (startElement, endElement, text, comment, cdata).
- Backed by the existing scanner; optional to avoid extra footprint.

## 7) Limits hardening
- Apply `entityExpansionLimit` consistently if/when entities are added.
- Enforce `maxDepth`, `maxTextLength`, `maxCommentLength` along the hot-path with minimal overhead.
- Merge adjacent text nodes to reduce tree fragmentation and memory overhead.

## 8) Benchmarks and profiling
- Add `scripts/bench/*.ts` with representative samples (LLM outputs, large comments, mixed CDATA).
- Report ops/time and memory deltas across Node versions.
- Compare permissive vs strict mode overhead.

## 9) ESM build simplification (future)
- Consider authoring imports with explicit `.js` extensions under `moduleResolution: NodeNext`.
- Remove the post-build patch script once the ecosystem is fully NodeNext-ready.

## 10) Developer ergonomics
- Typed error codes and suggestions enums for editor completion.
- More targeted subpath exports (e.g., `@luciformresearch/xmlparser/sax`).
- Additional helper methods (e.g., `element.innerText()`, `document.queryAll('ns:tag')`).

## Prioritization
- P1: Namespaces, DOCTYPE fidelity, attribute validation/limits.
- P2: Recovery policy controls, streaming/SAX, limits hardening.
- P3: Benchmarks/profiling, ESM build simplification, ergonomics.

