# LR XMLParser — Parser XML modulaire, robuste et sûr

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Performance](https://img.shields.io/badge/Benchmarks-2x%20plus%20rapide-green)](./test-integration.ts)
[![Status](https://img.shields.io/badge/Status-Ready%20for%20LLM%20workflows-success)](#usages-cl%C3%A9s)

Parser XML hautes performances, conçu pour les pipelines IA modernes. LR XMLParser est particulièrement optimisé pour les réponses XML générées par des LLM (mode permissif et récupération d’erreurs), tout en restant strict, traçable et sécurisé pour les cas de production.

English version: see README.en.md

Projet mené par LuciformResearch (Lucie Defraiteur).

## Licence

Licence MIT avec clause d’attribution renforcée. Voir [LICENSE](LICENSE) pour les termes, obligations d’attribution et usages autorisés.

## Aperçu

LR XMLParser adopte une architecture modulaire (scanner → parser → modèles → diagnostics) issue d’une refactorisation complète d’un fichier monolithique (~1468 lignes) vers des composants spécialisés. Résultat: code plus lisible, testable et performant.

### Usages clés

- Réponses LLM structurées (mode « luciform-permissive » pour tolérance aux erreurs et récupération).
- Parsing XML générique avec diagnostics précis (ligne/colonne) et limites configurables.
- Intégration dans des pipelines IA (LR HMM) et des systèmes plus larges (LR Hub).

Exemple d’usage dans un moteur de mémoire hiérarchique:
```typescript
// Génération de réponse structurée par LLM
const xmlResponse = await generateStructuredXML('l1', documents, {
  useVertex: true,
  model: 'gemini-1.5-pro',
  maxOutputTokens: 1024,
  minChars: 100,
  maxChars: 500
});

// Parsing robuste de la réponse LLM
const parser = new LuciformXMLParser(xmlResponse.xml, { 
  mode: 'luciform-permissive',
  maxTextLength: 100000 
});
const result = parser.parse();

if (result.success) {
  const summary = result.document?.findElement('summary')?.getText();
  const tags = result.document?.findAllElements('tag').map(t => t.getText());
  // Traitement des données structurées...
}
```

## Structure du code

```
lr_xmlparser/
├── index.ts         # Parser principal (API publique)
├── scanner.ts       # Scanner/Tokenizer à états
├── document.ts      # Modèles XML (Document/Element/Node)
├── diagnostics.ts   # Diagnostics détaillés (codes, messages, suggestions)
├── migration.ts     # Couche de compatibilité (ancien → nouveau)
├── types.ts         # Types et interfaces partagés
└── test-integration.ts
```

## Pourquoi LR XMLParser

- Performance: ~2× plus rapide que l’implémentation précédente sur nos jeux d’essai internes (voir `test-integration.ts`).
- Maintenabilité: modules 50–300 lignes, séparation claire des responsabilités.
- Testabilité: composants isolés, intégration validée, facilité de débogage.
- Réutilisabilité: scanner autonome, diagnostics extensibles, modèles indépendants.
- Pensé LLM: mode permissif, récupération d’erreurs, CDATA, tolérance de variantes de format.

## API express

Types principaux (extraits):
```typescript
export interface Location { line: number; column: number; position: number; }
export interface Token { type: string; content: string; location: Location; }
export interface ParseResult { success: boolean; document?: XMLDocument; }
// ... autres types
```
Scanner:
```typescript
export class LuciformXMLScanner {
  next(): Token | null;
  reset(): void;
  getState(): ScannerState;
}
```
Modèles de document:
```typescript
export class XMLDocument { /* Document XML complet */ }
export class XMLElement extends XMLNode { /* Élément XML */ }
export class XMLNode { /* Nœud XML de base */ }
```
Diagnostics:
```typescript
export class DiagnosticManager {
  addError(code: string, message: string): void;
  addWarning(code: string, message: string): void;
  getRecoveryCount(): number;
}
```
Parser principal:
```typescript
export class LuciformXMLParser {
  constructor(content: string, options?: ParserOptions);
  parse(): ParseResult;
}
```

## Migration depuis l’ancien parser

### Option 1 — Migration directe
```typescript
// Ancien
import { LuciformXMLParser } from './llm/LuciformXMLParser';

// Nouveau
import { LuciformXMLParser } from './xml-parser/index';
```

### Option 2 — Compatibilité
```typescript
import { LuciformXMLParserCompat } from './xml-parser/migration';

// API identique, pas de changement de code nécessaire
const parser = new LuciformXMLParserCompat(xml, options);
const result = parser.parse();
```

## Tests et validation

### Tests de compatibilité
```bash
npx tsx test-xml-refactor.ts
```

Résultats (exemples internes):
- ✅ XML simple valide
- ✅ XML avec erreurs (mode permissif)
- ✅ XML complexe avec CDATA et commentaires
- ✅ Performance et limites (201 nœuds en 2ms)
- ✅ Compatibilité avec l'ancien parser

## Métriques (refactorisation)

| Métrique | Ancien | Nouveau | Amélioration |
|----------|--------|---------|--------------|
| **Taille totale** | 1468 lignes | ~1000 lignes | -32% |
| **Plus gros module** | 1468 lignes | 300 lignes | -80% |
| **Performance** | 4ms | 2ms | +100% |
| **Modules** | 1 | 6 | +500% |
| **Testabilité** | Difficile | Facile | ✅ |

## Utilisation

### Cas d’usage principal — Réponses LLM structurées

#### Exemple 1 — Parser de résumé hiérarchique (L1)
```typescript
// Réponse LLM typique pour un résumé L1
const llmResponse = `
<l1 minChars="100" maxChars="500" version="1">
  <summary><![CDATA[Discussion sur l'optimisation des performances du parser XML. 
  Les améliorations incluent une architecture modulaire et une réduction de 50% 
  du temps de parsing.]]></summary>
  <tags>
    <tag>performance</tag>
    <tag>xml-parser</tag>
    <tag>optimisation</tag>
  </tags>
  <entities>
    <persons><p>Lucie Defraiteur</p></persons>
    <orgs><o>LuciformResearch</o></orgs>
    <places><pl>Développement</pl></places>
  </entities>
</l1>`;

const parser = new LuciformXMLParser(llmResponse, { 
  mode: 'luciform-permissive',
  maxTextLength: 100000 
});
const result = parser.parse();

if (result.success) {
  const summary = result.document?.findElement('summary')?.getText();
  const tags = result.document?.findAllElements('tag').map(t => t.getText());
  const persons = result.document?.findElement('persons')?.findAllElements('p').map(p => p.getText());
  
  console.log('Résumé:', summary);
  console.log('Tags:', tags);
  console.log('Personnes:', persons);
}
```

#### Exemple 2 — Parser de résumé de niveau supérieur (L2)
```typescript
// Réponse LLM pour un résumé L2 (plus abstrait)
const l2Response = `
<l2 minChars="200" maxChars="800" version="1">
  <summary><![CDATA[Synthèse des développements techniques majeurs : 
  refactorisation complète du parser XML avec amélioration des performances, 
  implémentation d'une architecture modulaire, et intégration dans le système 
  de mémoire hiérarchique LR Hub™.]]></summary>
  <tags>
    <tag>architecture</tag>
    <tag>refactoring</tag>
    <tag>système-mémoire</tag>
  </tags>
  <entities>
    <persons><p>Lucie Defraiteur</p></persons>
    <artifacts><a>LR XMLParser</a><a>LR Hub</a></artifacts>
    <places><pl>Développement</pl></places>
    <times><t>2025</t></times>
  </entities>
</l2>`;

const parser = new LuciformXMLParser(l2Response, { 
  mode: 'luciform-permissive' 
});
const result = parser.parse();

// Extraction des artefacts (spécifique au niveau L2)
const artifacts = result.document?.findElement('artifacts')?.findAllElements('a').map(a => a.getText());
console.log('Artefacts:', artifacts); // ['LR XMLParser', 'LR Hub']
```

#### Exemple 3 — Gestion d’erreurs LLM robuste
```typescript
// LLM peut parfois générer du XML malformé
const malformedLLMResponse = `
<l1>
  <summary><![CDATA[Résumé du projet...]]></summary>
  <tags>
    <tag>incomplete
  </tags>
  <entities>
    <persons><p>Lucie</p></persons>
  </entities>
</l1>`;

const parser = new LuciformXMLParser(malformedLLMResponse, { 
  mode: 'luciform-permissive', // Mode permissif pour LLM
  maxTextLength: 100000 
});
const result = parser.parse();

if (result.success) {
  console.log('Parsing réussi malgré les erreurs LLM');
  const summary = result.document?.findElement('summary')?.getText();
  console.log('Résumé extrait:', summary);
} else {
  console.log('Erreurs de parsing:', result.errors);
  // Le parser peut souvent récupérer partiellement le contenu
}
```

### Parser basique
```typescript
import { LuciformXMLParser } from './xml-parser/index';

const parser = new LuciformXMLParser(xmlContent);
const result = parser.parse();

if (result.success) {
  console.log('Document parsé:', result.document);
} else {
  console.log('Erreurs:', result.errors);
}
```

### Parser avec options
```typescript
const parser = new LuciformXMLParser(xmlContent, {
  maxDepth: 100,
  maxTextLength: 50000,
  mode: 'luciform-permissive' // Recommandé pour les réponses LLM
});
```

### Recherche d’éléments
```typescript
const document = result.document!;
const element = document.findElement('summary');
const allTags = document.findAllElements('tag');
```

## Cas d’usage avancés

### Systèmes de mémoire hiérarchique
- **L1 (Niveau 1)** : Résumés de conversations individuelles
- **L2 (Niveau 2)** : Synthèses de groupes de résumés L1
- **Extraction d'entités** : Personnes, organisations, lieux, artefacts
- **Tagging automatique** : Classification thématique

### Pipelines d’IA
- **Préprocessing** : Nettoyage des réponses LLM avant traitement
- **Validation** : Vérification de la structure des données
- **Transformation** : Conversion vers d'autres formats
- **Monitoring** : Détection d'erreurs dans les réponses LLM

### Intégration dans un système de chat IA
```typescript
// Exemple d'intégration avec un système de chat IA
class ChatMemorySystem {
  async processLLMResponse(xmlResponse: string) {
    const parser = new LuciformXMLParser(xmlResponse, { 
      mode: 'luciform-permissive' 
    });
    const result = parser.parse();
    
    if (result.success) {
      return {
        summary: this.extractSummary(result.document),
        tags: this.extractTags(result.document),
        entities: this.extractEntities(result.document)
      };
    }
    
    // Fallback pour XML malformé
    return this.fallbackProcessing(xmlResponse);
  }
}
```

## Feuille de route

### Améliorations prévues
- [ ] Parser SAX séparé pour gros fichiers
- [ ] Support des namespaces avancés
- [ ] Validation XSD intégrée
- [ ] Streaming pour fichiers volumineux
- [ ] Optimisations mémoire

### Extensions possibles
- [ ] Parser JSON vers XML
- [ ] Transformations XSLT
- [ ] Validation RelaxNG
- [ ] Support des entités externes

### Optimisations LLM
- [ ] Détection automatique des formats LLM
- [ ] Correction intelligente des erreurs XML
- [ ] Support des formats de sortie alternatifs
- [ ] Intégration avec des modèles de validation

## Notes techniques

### Compatibilité
- ✅ API identique à l'ancien parser
- ✅ Même format de résultats
- ✅ Même gestion des erreurs
- ✅ Migration transparente

### Sécurité
- ✅ Protection anti-DoS/XXE
- ✅ Limites configurables
- ✅ Validation stricte des entrées
- ✅ Gestion sécurisée des entités

### Performance
- ✅ Scanner optimisé
- ✅ Parsing incrémental
- ✅ Gestion mémoire efficace
- ✅ Récupération d'erreurs rapide

## Liens et intégrations

- Dépôt GitLab (source): https://gitlab.com/luciformresearch/lr_xmlparser
- Miroir GitHub: https://github.com/LuciformResearch/LR_XMLParser
- Utilisé par:
  - LR HMM (compression mémoire L1/L2, « xmlEngine »)
    - GitLab: https://gitlab.com/luciformresearch/lr_hmm
    - GitHub: https://github.com/LuciformResearch/LR_HMM
  - LR Hub (projet d’origine et socle): https://gitlab.com/luciformresearch/lr_chat

## Contribution

Contributions bienvenues.
- Fork → branche feature → MR/PR
- Style TypeScript simple, modules focalisés, pas de dépendances superflues
- Ajoutez des tests ciblés sur les modules impactés

## Getting started (npm)

- Installation (après publication):
  - `npm install @luciformresearch/xmlparser`
  - `pnpm add @luciformresearch/xmlparser` (pnpm)

- Exemples (ESM et CommonJS):
  ```ts
  // ESM
  import { LuciformXMLParser } from '@luciformresearch/xmlparser';
  
  const parser = new LuciformXMLParser(xml, { mode: 'luciform-permissive' });
  const result = parser.parse();
  if (result.success) {
    console.log(result.document?.findElement('summary')?.getText());
  }
  ```
  ```js
  // CommonJS
  const { LuciformXMLParser } = require('@luciformresearch/xmlparser');
  const parser = new LuciformXMLParser(xml, { mode: 'luciform-permissive' });
  const result = parser.parse();
  if (result.success) {
    console.log(result.document?.findElement('summary')?.getText());
  }
  ```

- Subpath exports (optionnels): `@luciformresearch/xmlparser/document`, `.../scanner`, `.../diagnostics`, `.../types`, `.../migration`.

## Support

- Bugs/Issues: ouvrez un ticket sur GitLab
- Questions: discussions GitLab ou contact direct
- Contact: luciedefraiteur@gmail.com

## Auteur

Lucie Defraiteur — LuciformResearch
- GitLab: https://gitlab.com/luciformresearch
- Site: https://luciformresearch.com

—

Status: refactorisation complète validée • Performance: ~2× plus rapide • Maintenabilité: architecture modulaire • Compatibilité: migration transparente
