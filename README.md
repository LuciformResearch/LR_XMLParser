# LR XMLParser — Modular, robust and safe XML parser

[![npm](https://img.shields.io/npm/v/%40luciformresearch%2Fxmlparser)](https://www.npmjs.com/package/@luciformresearch/xmlparser)
[![npm downloads](https://img.shields.io/npm/dm/%40luciformresearch%2Fxmlparser)](https://www.npmjs.com/package/@luciformresearch/xmlparser)
[![types](https://img.shields.io/badge/types-included-blue)](./dist/types/index.d.ts)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Benchmarks](https://img.shields.io/badge/Benchmarks-suite-green)](./test-integration.ts)
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

## Express API

```ts
export class LuciformXMLParser {
  constructor(content: string, options?: ParserOptions);
  parse(): ParseResult;
}
```

Options include security and performance limits (depth, text length, entity expansion), plus mode: `strict | permissive | luciform-permissive`.

<!-- Migration notes removed to keep README product‑focused. Compatibility wrapper remains available via subpath export if needed. -->

## Error handling

- Inspect `result.diagnostics` for structured issues (code, message, suggestion, location).
- `result.success` is false when errors are present; permissive mode may still return a usable `document`.
- Typical codes: `UNCLOSED_TAG`, `MISMATCHED_TAG`, `INVALID_COMMENT`, `INVALID_CDATA`, `MAX_DEPTH_EXCEEDED`, `MAX_TEXT_LENGTH_EXCEEDED`.

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
