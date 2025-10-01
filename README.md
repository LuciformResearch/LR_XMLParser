# 🦊 LR XMLParser™ - Parser XML Modulaire

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Performance](https://img.shields.io/badge/Performance-2x%20faster-green)](https://github.com/LuciformResearch/LR_XMLParser)

Parser XML haute performance avec architecture modulaire. Créé par **Lucie Defraiteur**.

## 📝 Licence

Ce projet est sous **licence MIT avec clause d'attribution renforcée**. 

### ✅ **Autorisé** :
- Utiliser le code comme référence/inspiration
- Copier des parties du code avec attribution
- Modifier et adapter des composants
- Utiliser dans des projets personnels/commerciaux

### ❌ **Interdit** :
- Copier le projet entier sans attribution
- Prétendre être l'auteur original
- Supprimer les mentions de copyright

### 📋 **Attribution obligatoire** :
- "Basé sur LR XMLParser™ par Lucie Defraiteur"
- Lien vers le projet original
- Conservation des mentions de copyright

Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🎯 Vue d'ensemble

Le `LuciformXMLParser` a été refactorisé d'un fichier monolithique de **1468 lignes** vers une architecture modulaire composée de plusieurs modules spécialisés. Cette refactorisation améliore la maintenabilité, la testabilité et les performances.

## 📁 Structure des modules

```
src/lib/xml-parser/
├── types.ts              # Interfaces et types (50 lignes)
├── scanner.ts            # Scanner XML robuste (300 lignes)
├── document.ts           # Modèles XML (200 lignes)
├── diagnostics.ts        # Gestion des erreurs (250 lignes)
├── migration.ts           # Compatibilité avec l'ancien parser (100 lignes)
├── index.ts              # Parser principal (200 lignes)
└── README.md             # Documentation
```

## 🚀 Avantages de la refactorisation

### **Performance**
- **2x plus rapide** que l'ancien parser
- Parsing de 201 nœuds en 2ms vs 4ms
- Optimisations par module

### **Maintenabilité**
- Modules de **50-300 lignes** vs **1468 lignes**
- Séparation claire des responsabilités
- Code plus lisible et modulaire

### **Testabilité**
- Tests unitaires possibles par module
- Isolation des composants
- Debugging simplifié

### **Réutilisabilité**
- Scanner réutilisable pour d'autres parsers
- Modèles XML indépendants
- Système de diagnostics extensible

## 📦 Modules détaillés

### **types.ts** - Définitions centralisées
```typescript
export interface Location { line: number; column: number; position: number; }
export interface Token { type: string; content: string; location: Location; }
export interface ParseResult { success: boolean; document?: XMLDocument; }
// ... autres types
```

### **scanner.ts** - Tokenizer robuste
```typescript
export class LuciformXMLScanner {
  next(): Token | null;
  reset(): void;
  getState(): ScannerState;
}
```

### **document.ts** - Modèles XML
```typescript
export class XMLDocument { /* Document XML complet */ }
export class XMLElement extends XMLNode { /* Élément XML */ }
export class XMLNode { /* Nœud XML de base */ }
```

### **diagnostics.ts** - Gestion des erreurs
```typescript
export class DiagnosticManager {
  addError(code: string, message: string): void;
  addWarning(code: string, message: string): void;
  getRecoveryCount(): number;
}
```

### **index.ts** - Parser principal
```typescript
export class LuciformXMLParser {
  constructor(content: string, options?: ParserOptions);
  parse(): ParseResult;
}
```

## 🔄 Migration depuis l'ancien parser

### **Option 1: Migration directe**
```typescript
// Ancien
import { LuciformXMLParser } from './llm/LuciformXMLParser';

// Nouveau
import { LuciformXMLParser } from './xml-parser/index';
```

### **Option 2: Compatibilité**
```typescript
import { LuciformXMLParserCompat } from './xml-parser/migration';

// API identique, pas de changement de code nécessaire
const parser = new LuciformXMLParserCompat(xml, options);
const result = parser.parse();
```

## 🧪 Tests et validation

### **Tests de compatibilité**
```bash
npx tsx test-xml-refactor.ts
```

### **Résultats des tests**
- ✅ XML simple valide
- ✅ XML avec erreurs (mode permissif)
- ✅ XML complexe avec CDATA et commentaires
- ✅ Performance et limites (201 nœuds en 2ms)
- ✅ Compatibilité avec l'ancien parser

## 📊 Métriques de la refactorisation

| Métrique | Ancien | Nouveau | Amélioration |
|----------|--------|---------|--------------|
| **Taille totale** | 1468 lignes | ~1000 lignes | -32% |
| **Plus gros module** | 1468 lignes | 300 lignes | -80% |
| **Performance** | 4ms | 2ms | +100% |
| **Modules** | 1 | 6 | +500% |
| **Testabilité** | Difficile | Facile | ✅ |

## 🎯 Utilisation

### **Parser basique**
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

### **Parser avec options**
```typescript
const parser = new LuciformXMLParser(xmlContent, {
  maxDepth: 100,
  maxTextLength: 50000,
  mode: 'luciform-permissive'
});
```

### **Recherche d'éléments**
```typescript
const document = result.document!;
const element = document.findElement('child');
const allElements = document.findAllElements('item');
```

## 🔮 Évolutions futures

### **Améliorations prévues**
- [ ] Parser SAX séparé pour gros fichiers
- [ ] Support des namespaces avancés
- [ ] Validation XSD intégrée
- [ ] Streaming pour fichiers volumineux
- [ ] Optimisations mémoire

### **Extensions possibles**
- [ ] Parser JSON vers XML
- [ ] Transformations XSLT
- [ ] Validation RelaxNG
- [ ] Support des entités externes

## 📝 Notes techniques

### **Compatibilité**
- ✅ API identique à l'ancien parser
- ✅ Même format de résultats
- ✅ Même gestion des erreurs
- ✅ Migration transparente

### **Sécurité**
- ✅ Protection anti-DoS/XXE
- ✅ Limites configurables
- ✅ Validation stricte des entrées
- ✅ Gestion sécurisée des entités

### **Performance**
- ✅ Scanner optimisé
- ✅ Parsing incrémental
- ✅ Gestion mémoire efficace
- ✅ Récupération d'erreurs rapide

---

## 👩‍💻 Auteur

**Lucie Defraiteur**
- 📧 Email : luciedefraiteur@gmail.com
- 🦊 GitLab : [@luciformresearch](https://gitlab.com/luciformresearch)
- 🌐 Site : [luciformresearch.com](https://luciformresearch.com)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Merge Request

## 📞 Support

Pour toute question ou problème :
- 🐛 **Bugs** : Ouvrir une issue sur GitLab
- 💡 **Suggestions** : Créer une discussion
- 📧 **Contact** : luciedefraiteur@gmail.com

---

<div align="center">
  <p>Fait avec ❤️ par <strong>Lucie Defraiteur</strong></p>
  <p>🦊 <a href="https://gitlab.com/luciformresearch">GitLab</a> | 🌐 <a href="https://luciformresearch.com">Site Web</a></p>
</div>

**Status**: ✅ **Refactorisation complète et validée**  
**Performance**: 🚀 **2x plus rapide**  
**Maintenabilité**: 📦 **Architecture modulaire**  
**Compatibilité**: 🔄 **Migration transparente**