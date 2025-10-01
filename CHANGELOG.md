# Changelog

All notable changes to this project will be documented in this file.

- 0.1.3
  - Fix ESM Node compatibility (explicit .js extensions in dist/esm)
  - Switch CJS to nested package `type: commonjs`
  - Improve exports map for subpaths
- 0.1.4
  - Enforce ESLint rules in source (no-case-declarations, no-unused-vars)
  - Add ESLint/Prettier/Vitest configs and CI matrices
  - Add initial unit tests and README badges
- 0.1.5
  - Move Getting started to top of README (EN/FR)
  - Add docs/LLM_XML.md and docs/Security_XML.md
  - Add scanner/diagnostics/permissive tests; all passing
- 0.1.6
  - Add Error handling sections to README (EN/FR)
  - Add edge-case tests and list them in READMEs
- 0.1.7
  - Namespaces (phase 1): xmlns mapping, unbound prefix diagnostics; hide xmlns from attributes
  - DOCTYPE fidelity: extract root name and PUBLIC/SYSTEM
  - Attribute checks: duplicates surfaced; count/value length limits enforced
- 0.1.8
  - Namespaces (phase 2): stricter QName validation (BAD_QNAME); reserved prefix checks (XMLNS_PREFIX_RESERVED, XML_PREFIX_URI)
  - ns-aware query helpers: findByNS/findAllByNS on Document/Element
  - README edge cases updated to mention namespaces
- 0.1.2
  - Update contact email and README defaults (English primary, French secondary)
- 0.1.1
  - Initial public release with dual ESM/CJS and exports map
