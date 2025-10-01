# LR XMLParser — LLM XML Guide

This guide shows how to parse LLM‑generated XML robustly and securely.

## Goals

- Extract structured content (summary, tags, entities) from LLM outputs
- Be resilient to minor malformations (missing end tags, comments, CDATA)
- Keep performance predictable with safe limits

## Recommended options

```ts
import { LuciformXMLParser } from '@luciformresearch/xmlparser';

const parser = new LuciformXMLParser(xml, {
  mode: 'luciform-permissive',   // tolerate minor issues while recovering
  maxDepth: 100,                 // avoid pathological nesting
  maxTextLength: 100_000,        // prevent large text payloads
  allowDTD: false                // safe default
});
const result = parser.parse();
```

- Check `result.success` when you require strict success.
- In permissive mode, you can still inspect `result.document` and `result.diagnostics`.

## Common patterns

### 1) Hierarchical summary (L1)

```xml
<l1 minChars="100" maxChars="500" version="1">
  <summary><![CDATA[...]]></summary>
  <tags>
    <tag>performance</tag>
    <tag>xml-parser</tag>
  </tags>
  <entities>
    <persons><p>Alice</p></persons>
    <orgs><o>Acme</o></orgs>
  </entities>
</l1>
```

Extraction:

```ts
const summary = result.document?.findElement('summary')?.getText();
const tags = result.document?.findAllElements('tag').map(t => t.getText());
```

### 2) Malformed outputs (recover)

```xml
<l1>
  <summary>...
  <tags><tag>missing-close
</l1>
```

- In permissive mode the parser adds diagnostics and attempts to recover.
- You can inspect `result.diagnostics` and keep the partial content.

### 3) CDATA and comments

- CDATA blocks are preserved as `cdata` nodes.
- Comments are preserved as `comment` nodes with `closed` info.

## Security and limits

- Keep `allowDTD: false` unless you explicitly need DTD handling.
- Set `maxDepth`, `maxTextLength`, and `entityExpansionLimit` to sensible values.
- Validate the presence of required elements (`summary`, `tags`, etc.) at the app layer.

## Examples in codebase

- See README usage examples and tests under `tests/`.

