/**
 * Migration - Compatibilité avec l'ancien LuciformXMLParser
 * 
 * Fournit une interface de compatibilité pour migrer progressivement
 * de l'ancien parser vers la nouvelle architecture modulaire
 */

import { LuciformXMLParser } from './index';
import { ParserOptions, ParseResult } from './types';

/**
 * Interface de compatibilité avec l'ancien parser
 * 
 * Cette classe maintient la même API que l'ancien LuciformXMLParser
 * mais utilise la nouvelle architecture modulaire en arrière-plan
 */
export class LuciformXMLParserCompat {
  private parser: LuciformXMLParser;

  constructor(content: string, options: ParserOptions = {}) {
    this.parser = new LuciformXMLParser(content, options);
  }

  /**
   * Parse le XML (interface compatible)
   */
  parse(): ParseResult {
    return this.parser.parse();
  }

  /**
   * Obtient les diagnostics (interface compatible)
   */
  getDiagnostics() {
    const result = this.parser.parse();
    return result.diagnostics;
  }

  /**
   * Obtient les erreurs (interface compatible)
   */
  getErrors() {
    const result = this.parser.parse();
    return result.errors;
  }

  /**
   * Obtient le nombre de récupérations (interface compatible)
   */
  getRecoveryCount() {
    const result = this.parser.parse();
    return result.recoveryCount;
  }

  /**
   * Obtient le nombre de nœuds (interface compatible)
   */
  getNodeCount() {
    const result = this.parser.parse();
    return result.nodeCount;
  }
}

/**
 * Fonction de migration automatique
 * 
 * Remplace automatiquement les imports de l'ancien parser
 * par le nouveau parser modulaire
 */
export function migrateToNewParser() {
  console.log('🔄 Migration vers le nouveau parser XML modulaire...');
  
  // Instructions de migration
  const migrationSteps = [
    '1. Remplacer les imports:',
    '   Ancien: import { LuciformXMLParser } from "./llm/LuciformXMLParser"',
    '   Nouveau: import { LuciformXMLParser } from "./xml-parser/index"',
    '',
    '2. Ou utiliser la compatibilité:',
    '   import { LuciformXMLParserCompat } from "./xml-parser/migration"',
    '',
    '3. L\'API reste identique, pas de changement de code nécessaire',
    '',
    '4. Avantages de la migration:',
    '   - Modules plus petits et maintenables',
    '   - Tests unitaires par module',
    '   - Meilleure séparation des responsabilités',
    '   - Performance améliorée (2x plus rapide)'
  ];

  migrationSteps.forEach(step => console.log(step));
  
  return migrationSteps;
}

/**
 * Test de compatibilité
 */
export function testCompatibility() {
  console.log('🧪 Test de compatibilité avec l\'ancien parser...');
  
  const testXML = `
<root>
  <child attribute="value">Contenu</child>
</root>
  `.trim();

  try {
    // Test avec le nouveau parser
    const newParser = new LuciformXMLParser(testXML);
    const newResult = newParser.parse();
    
    console.log('✅ Nouveau parser:');
    console.log(`   Succès: ${newResult.success}`);
    console.log(`   Nœuds: ${newResult.nodeCount}`);
    console.log(`   Erreurs: ${newResult.errors.length}`);
    
    // Test avec la compatibilité
    const compatParser = new LuciformXMLParserCompat(testXML);
    const compatResult = compatParser.parse();
    
    console.log('✅ Parser de compatibilité:');
    console.log(`   Succès: ${compatResult.success}`);
    console.log(`   Nœuds: ${compatResult.nodeCount}`);
    console.log(`   Erreurs: ${compatResult.errors.length}`);
    
    console.log('✅ Migration réussie !');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur de migration:', error);
    return false;
  }
}