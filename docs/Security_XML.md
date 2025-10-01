# LR XMLParser — Security Notes

This document summarizes secure defaults and recommended limits when parsing XML.

## Secure defaults

- `allowDTD: false` (default): disables DTD to avoid XXE and entity expansion risks.
- `entityExpansionLimit`: ensure a sane cap (e.g., 1000) to prevent resource abuse.
- `maxDepth`: cap nesting (e.g., 50–100) to avoid deep recursion.
- `maxTextLength`: cap text nodes to prevent memory spikes.

## Usage example

```ts
import { LuciformXMLParser } from '@luciformresearch/xmlparser';

const parser = new LuciformXMLParser(xml, {
  allowDTD: false,
  entityExpansionLimit: 1000,
  maxDepth: 100,
  maxTextLength: 100_000,
});
const result = parser.parse();
```

## Operational guidance

- Validate required elements after parsing (application-level validation).
- Log diagnostics in permissive mode for monitoring malformed outputs.
- Consider timeouts and input size limits before parsing in upstream layers.
- Keep the parser updated and pinned via lockfiles in production.

## References

- OWASP XML External Entity Prevention Cheat Sheet
- NIST Secure Coding practices for XML parsers

