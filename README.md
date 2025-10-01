# LR XMLParser — Modular, robust and safe XML parser

[![npm](https://img.shields.io/npm/v/%40luciformresearch%2Fxmlparser)](https://www.npmjs.com/package/@luciformresearch/xmlparser)
[![npm downloads](https://img.shields.io/npm/dm/%40luciformresearch%2Fxmlparser)](https://www.npmjs.com/package/@luciformresearch/xmlparser)
[![types](https://img.shields.io/badge/types-included-blue)](./dist/types/index.d.ts)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Benchmarks](https://img.shields.io/badge/Benchmarks-suite-green)](./docs/BENCHMARKS.md)
[![Status](https://img.shields.io/badge/Status-Ready%20for%20LLM%20workflows-success)](#key-use-cases)

High‑performance XML parser designed for modern AI pipelines. LR XMLParser is optimized for LLM‑generated XML (permissive mode with error recovery) while remaining strict, traceable, and secure for production workloads.

Project by LuciformResearch (Lucie Defraiteur).

— Français: see README.fr.md

## Getting started (npm)

- Install:
  - `npm install @luciformresearch/xmlparser`
  - `pnpm add @luciformresearch/xmlparser`

- Examples (ESM and CommonJS):

  ```ts
  // ESM
  import { LuciformXMLParser } from '@luciformresearch/xmlparser';
  const result = new LuciformXMLParser(xml, { mode: 'luciform-permissive' }).parse();
  ```

  ```js
  // CommonJS
  const { LuciformXMLParser } = require('@luciformresearch/xmlparser');
  const result = new LuciformXMLParser(xml, { mode: 'luciform-permissive' }).parse();
  ```

- Subpath exports (optional): `@luciformresearch/xmlparser/document`, `.../scanner`, `.../diagnostics`, `.../types`, `.../migration`.

## License

MIT with reinforced attribution. See [LICENSE](LICENSE) for terms, attribution obligations, and allowed uses.

## Overview

LR XMLParser follows a modular architecture (scanner → parser → models → diagnostics) focused on clarity, testability, and performance.

### Key use cases

- Structured LLM responses ("luciform‑permissive" mode to tolerate and recover from common LLM formatting issues).
- General XML parsing with precise diagnostics (line/column) and configurable limits.
- Integration in AI pipelines (LR HMM) and larger systems (LR Hub).

Example within a hierarchical memory engine:

```ts
const parser = new LuciformXMLParser(xml, {
  mode: 'luciform-permissive',
  maxTextLength: 100_000,
});
const result = parser.parse();
if (result.success) {
  const summary = result.document?.findElement('summary')?.getText();
}
```

## Code structure

```
lr_xmlparser/
├── index.ts         # Main parser (public API)
├── scanner.ts       # Stateful tokenizer
├── document.ts      # XML models (Document/Element/Node)
├── diagnostics.ts   # Diagnostics (codes, messages, suggestions)
├── migration.ts     # Compatibility layer (legacy → new)
├── types.ts         # Shared types and interfaces
└── test-integration.ts
```

## Why LR XMLParser

- Performance: fast on practical workloads (see `test-integration.ts`).
- Maintainability: focused modules with clear separation of concerns.
- Testability: isolated components, validated integration, easier debugging.
- Reusability: standalone scanner, extensible diagnostics, independent models.
- LLM‑oriented: permissive mode, error recovery, CDATA handling, format tolerance.

## Edge cases covered

- Attributes and self-closing tags (`<child a="1" b="two"/>`)
- Unclosed comments/CDATA: permissive mode recovers and logs diagnostics
- Mismatched tags: errors with precise codes and locations
- Limits: `maxDepth`, `maxTextLength`, `maxPILength`
- Processing instructions and DOCTYPE handling
- BOM + whitespace tolerance
- Namespaces: `xmlns`/`xmlns:prefix` mapping, unbound prefix diagnostics

## Express API

```ts
export class LuciformXMLParser {
  constructor(content: string, options?: ParserOptions);
  parse(): ParseResult;
}
```

Options include security and performance limits (depth, text length, entity expansion), plus mode: `strict | permissive | luciform-permissive`.

Additional option:
- `coalesceTextNodes?: boolean` (default `true`): merges adjacent text nodes under the same parent to reduce node fragmentation without changing text content.

Namespace-aware queries:
```ts
// Given <root xmlns:foo="urn:foo"><foo:item/></root>
const item = result.document?.findByNS('urn:foo', 'item');
const items = result.document?.findAllByNS('urn:foo', 'item');
```

SAX/streaming (large inputs):
```ts
import { LuciformSAX } from '@luciformresearch/xmlparser/sax';

new LuciformSAX(xml, {
  onStartElement: (name, attrs) => { /* ... */ },
  onEndElement: (name) => {},
  onText: (text) => {},
}).run();
```

## Namespaces

- Default namespace applies to elements, not attributes.
- Prefixed names (e.g., `foo:bar`) require a bound `xmlns:foo` in scope.
- Reserved: `xmlns` prefix/name; `xml` must map to `http://www.w3.org/XML/1998/namespace`.
- Use `findByNS(nsUri, local)`/`findAllByNS` for ns-aware traversal.

### Quick Reference

| Case | Element resolution | Attribute resolution | Example |
| --- | --- | --- | --- |
| Default namespace declared (`xmlns="urn:d"`) | Applies to element names | Does not apply to attributes | `<root xmlns="urn:d"><item a="1"/></root>` → `item` resolves to `urn:d:item`; `a` has no namespace |
| Prefixed element (`foo:bar`) | Requires `xmlns:foo="…"` in scope | n/a | `<x xmlns:foo="urn:f"><foo:bar/></x>` → element resolves to `urn:f:bar` |
| Prefixed attribute (`foo:a`) | n/a | Requires `xmlns:foo="…"` in scope | `<x xmlns:foo="urn:f" foo:a="1"/>` → attribute `a` in `urn:f` |
| Unbound prefix | Diagnostic `UNDEFINED_PREFIX` | Diagnostic `UNDEFINED_PREFIX` | `<a:b/>` without `xmlns:a` |
| Reserved names | Diagnostic (`XMLNS_PREFIX_RESERVED`, `XML_PREFIX_URI`) | Diagnostic | `xmlns:test`, `xml` bound to wrong URI |

<!-- Migration notes removed to keep README product‑focused. Compatibility wrapper remains available via subpath export if needed. -->

## Error handling

- Inspect `result.diagnostics` for structured issues (code, message, suggestion, location).
- `result.success` is false when errors are present; permissive mode may still return a usable `document`.
- Typical codes: `UNCLOSED_TAG`, `MISMATCHED_TAG`, `INVALID_COMMENT`, `INVALID_CDATA`, `MAX_DEPTH_EXCEEDED`, `MAX_TEXT_LENGTH_EXCEEDED`.
 - Recovery cap: set `maxRecoveries` to cap automatic fixes in permissive modes. When the cap is exceeded, the parser stops further scanning, adds `RECOVERY_ATTEMPTED` and `PARTIAL_PARSE` info diagnostics, and returns a partial document. See `result.recoveryReport` for `{ attempts, capped, codes?, notes? }`.

## Testing and validation

```bash
npx tsx test-integration.ts
```

Validated internally on:

- Valid simple XML
- Malformed XML (permissive mode)
- Complex XML with CDATA and comments
- Performance and limits
- Compatibility wrapper available

## Benchmarks

- Quick start:
  - Build: `npm run build`
  - Run: `npm run bench`
- Outputs throughput and average latency for several corpora, plus memory deltas when GC is available.
- Writes JSON reports to `Reports/Benchmarks/` for later comparison. See `docs/BENCHMARKS.md` for details.

## Links and integrations

- GitLab (source): https://gitlab.com/luciformresearch/lr_xmlparser
- GitHub mirror: https://github.com/LuciformResearch/LR_XMLParser
- Used by:
  - LR HMM (L1/L2 memory compression, "xmlEngine")
    - GitLab: https://gitlab.com/luciformresearch/lr_hmm
    - GitHub: https://github.com/LuciformResearch/LR_HMM
  - LR Hub (origin/base): https://gitlab.com/luciformresearch/lr_chat

## Contributing

PRs welcome.

- Fork → feature branch → MR/PR
- Keep modules focused; avoid unnecessary deps
- Add tests for affected modules

## Support

- Issues: open on GitLab
- Questions: GitLab discussions or direct contact
- Contact: luciedefraiteur@luciformresearch.com

—
