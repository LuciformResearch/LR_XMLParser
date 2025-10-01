# LR XMLParser — Parser XML modulaire, robuste et sûr

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Benchmarks](https://img.shields.io/badge/Benchmarks-~2x%20plus%20rapide-green)](./test-integration.ts)
[![Status](https://img.shields.io/badge/Status-Ready%20for%20LLM%20workflows-success)](#usages-cl%C3%A9s)

Parser XML hautes performances, conçu pour les pipelines IA modernes. Optimisé pour le XML généré par des LLM (mode permissif et récupération d’erreurs), tout en restant strict, traçable et sécurisé pour la production.

Projet mené par LuciformResearch (Lucie Defraiteur).

— English: see README.md

## Démarrage (npm)

- Installation:
  - `npm install @luciformresearch/xmlparser`
  - `pnpm add @luciformresearch/xmlparser`

- Exemples (ESM et CommonJS):
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

- Subpath exports (optionnels): `@luciformresearch/xmlparser/document`, `.../scanner`, `.../diagnostics`, `.../types`, `.../migration`.

## Aperçu

Architecture modulaire (scanner → parser → modèles → diagnostics) pensée pour la lisibilité, la testabilité et la performance.

### Usages clés

- Réponses LLM structurées (mode « luciform‑permissive » tolérant et récupérant les erreurs).
- Parsing XML générique avec diagnostics précis (ligne/colonne) et limites configurables.
- Intégration dans des pipelines IA (LR HMM) et des systèmes plus larges (LR Hub).

Exemple d’usage dans un moteur de mémoire hiérarchique:

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

## Structure du code

```
lr_xmlparser/
├── index.ts         # Parser principal (API publique)
├── scanner.ts       # Scanner/Tokenizer à états
├── document.ts      # Modèles XML (Document/Element/Node)
├── diagnostics.ts   # Diagnostics (codes, messages, suggestions)
├── migration.ts     # Couche de compatibilité
├── types.ts         # Types et interfaces partagés
└── test-integration.ts
```

## Pourquoi LR XMLParser

- Performance: rapide sur des cas pratiques (voir `test-integration.ts`).
- Maintenabilité: modules focalisés, séparation claire des responsabilités.
- Testabilité: composants isolés, intégration validée, débogage facilité.
- Réutilisabilité: scanner autonome, diagnostics extensibles, modèles indépendants.
- Orienté LLM: mode permissif, récupération d’erreurs, gestion CDATA, tolérance de format.

## Cas limites couverts

- Attributs et balises auto-fermantes (`<child a="1" b="two"/>`)
- Commentaires/CDATA non fermés: récupération + diagnostics en mode permissif
- Balises non appariées: erreurs avec codes et positions
- Limites: `maxDepth`, `maxTextLength`, `maxPILength`
- Instructions de traitement (PI) et DOCTYPE
- BOM + tolérance aux espaces
- Namespaces: gestion `xmlns`/`xmlns:prefix`, diagnostics de préfixe non lié

## API express

```ts
export class LuciformXMLParser {
  constructor(content: string, options?: ParserOptions);
  parse(): ParseResult;
}
```

Les options couvrent sécurité et performance (profondeur, longueur de texte, expansion d’entités), plus le mode: `strict | permissive | luciform-permissive`.

Requêtes sensibles aux namespaces:
```ts
// Étant donné <root xmlns:foo="urn:foo"><foo:item/></root>
const item = result.document?.findByNS('urn:foo', 'item');
const items = result.document?.findAllByNS('urn:foo', 'item');
```

SAX/streaming (gros flux):
```ts
import { LuciformSAX } from '@luciformresearch/xmlparser/sax';

new LuciformSAX(xml, {
  onStartElement: (name, attrs) => { /* ... */ },
  onEndElement: (name) => {},
  onText: (text) => {},
}).run();
```

## Namespaces

- Le namespace par défaut s’applique aux éléments, pas aux attributs.
- Les noms préfixés (ex: `foo:bar`) exigent un `xmlns:foo` lié en portée.
- Réservés: préfixe/nom `xmlns`; `xml` doit pointer vers `http://www.w3.org/XML/1998/namespace`.
- Utilisez `findByNS(nsUri, local)` / `findAllByNS` pour une traversée ns-aware.

### Référence rapide

| Cas | Résolution des éléments | Résolution des attributs | Exemple |
| --- | --- | --- | --- |
| Namespace par défaut (`xmlns="urn:d"`) | S’applique aux noms d’éléments | Ne s’applique pas aux attributs | `<root xmlns="urn:d"><item a="1"/></root>` → `item` résout vers `urn:d:item`; `a` n’a pas de namespace |
| Élément préfixé (`foo:bar`) | Requiert `xmlns:foo="…"` en portée | n/a | `<x xmlns:foo="urn:f"><foo:bar/></x>` → élément résout vers `urn:f:bar` |
| Attribut préfixé (`foo:a`) | n/a | Requiert `xmlns:foo="…"` en portée | `<x xmlns:foo="urn:f" foo:a="1"/>` → attribut `a` dans `urn:f` |
| Préfixe non lié | Diagnostic `UNDEFINED_PREFIX` | Diagnostic `UNDEFINED_PREFIX` | `<a:b/>` sans `xmlns:a` |
| Noms réservés | Diagnostic (`XMLNS_PREFIX_RESERVED`, `XML_PREFIX_URI`) | Diagnostic | `xmlns:test`, `xml` lié à une URI incorrecte |

## Tests et validation

```bash
npx tsx test-integration.ts
```

Validé en interne sur:

- XML simple valide
- XML malformé (mode permissif)
- XML complexe avec CDATA et commentaires
- Performance et limites
- Compatibilité d’API (couche de compatibilité disponible)

## Gestion des erreurs

- Consultez `result.diagnostics` pour des problèmes structurés (code, message, suggestion, position).
- `result.success` est `false` en cas d’erreurs; en mode permissif, `document` peut rester exploitable.
- Codes typiques: `UNCLOSED_TAG`, `MISMATCHED_TAG`, `INVALID_COMMENT`, `INVALID_CDATA`, `MAX_DEPTH_EXCEEDED`, `MAX_TEXT_LENGTH_EXCEEDED`.
 - Plafond de récupération: utilisez `maxRecoveries` pour limiter les corrections automatiques en modes permissifs. Au‑delà du plafond, le parseur s’arrête proprement, ajoute `RECOVERY_ATTEMPTED` et `PARTIAL_PARSE` (niveau info), et retourne un document partiel. Consultez `result.recoveryReport` pour `{ attempts, capped, codes?, notes? }`.

## Liens et intégrations

- GitLab (source): https://gitlab.com/luciformresearch/lr_xmlparser
- GitHub (miroir): https://github.com/LuciformResearch/LR_XMLParser
- Utilisé par:
  - LR HMM (compression L1/L2, « xmlEngine »)
    - GitLab: https://gitlab.com/luciformresearch/lr_hmm
    - GitHub: https://github.com/LuciformResearch/LR_HMM
  - LR Hub (socle): https://gitlab.com/luciformresearch/lr_chat

## Contribution

Contributions bienvenues.

- Fork → branche feature → MR/PR
- Modules focalisés; évitez les dépendances inutiles
- Ajoutez des tests pour les modules impactés

## Support

- Bugs: issues sur GitLab
- Questions: discussions GitLab ou contact direct
- Contact: luciedefraiteur@luciformresearch.com

—
