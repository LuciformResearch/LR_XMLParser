/**
 * Diagnostics - Gestion des erreurs et avertissements XML
 *
 * Système de diagnostic pour le parser XML avec codes d'erreur
 * et suggestions de correction
 */

import { Diagnostic, Location } from './types';

export class DiagnosticManager {
  private diagnostics: Diagnostic[] = [];
  private errors: Diagnostic[] = [];
  private recoveryCount: number = 0;
  private recoveryCap?: number;
  private recoveryCapped: boolean = false;

  /**
   * Ajoute un diagnostic
   */
  addDiagnostic(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);

    if (diagnostic.level === 'error') {
      this.errors.push(diagnostic);
    }
  }

  /**
   * Ajoute une erreur
   */
  addError(code: string, message: string, location?: Location, suggestion?: string): void {
    this.addDiagnostic({
      level: 'error',
      code,
      message,
      location,
      suggestion,
    });
  }

  /**
   * Ajoute un avertissement
   */
  addWarning(code: string, message: string, location?: Location, suggestion?: string): void {
    this.addDiagnostic({
      level: 'warn',
      code,
      message,
      location,
      suggestion,
    });
  }

  /**
   * Ajoute une info
   */
  addInfo(code: string, message: string, location?: Location, suggestion?: string): void {
    this.addDiagnostic({
      level: 'info',
      code,
      message,
      location,
      suggestion,
    });
  }

  /**
   * Incrémente le compteur de récupération
   */
  incrementRecovery(): void {
    this.recoveryCount++;
    if (this.recoveryCap !== undefined && this.recoveryCount > this.recoveryCap) {
      this.recoveryCapped = true;
    }
  }

  /**
   * Obtient tous les diagnostics
   */
  getDiagnostics(): Diagnostic[] {
    return [...this.diagnostics];
  }

  /**
   * Obtient les erreurs
   */
  getErrors(): Diagnostic[] {
    return [...this.errors];
  }

  /**
   * Obtient les avertissements
   */
  getWarnings(): Diagnostic[] {
    return this.diagnostics.filter((d) => d.level === 'warn');
  }

  /**
   * Obtient les infos
   */
  getInfos(): Diagnostic[] {
    return this.diagnostics.filter((d) => d.level === 'info');
  }

  /**
   * Obtient le nombre de récupérations
   */
  getRecoveryCount(): number {
    return this.recoveryCount;
  }

  setRecoveryCap(cap?: number): void {
    this.recoveryCap = cap;
  }

  getRecoveryReport(): { attempts: number; capped: boolean } {
    return { attempts: this.recoveryCount, capped: this.recoveryCapped };
  }

  /**
   * Indique si la limite de récupération a été dépassée
   */
  isRecoveryCapped(): boolean {
    return this.recoveryCapped;
  }

  /**
   * Vérifie s'il y a des erreurs
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Vérifie s'il y a des avertissements
   */
  hasWarnings(): boolean {
    return this.getWarnings().length > 0;
  }

  /**
   * Remet à zéro les diagnostics
   */
  reset(): void {
    this.diagnostics = [];
    this.errors = [];
    this.recoveryCount = 0;
  }

  /**
   * Obtient un résumé des diagnostics
   */
  getSummary(): {
    total: number;
    errors: number;
    warnings: number;
    infos: number;
    recoveries: number;
  } {
    return {
      total: this.diagnostics.length,
      errors: this.errors.length,
      warnings: this.getWarnings().length,
      infos: this.getInfos().length,
      recoveries: this.recoveryCount,
    };
  }
}

/**
 * Codes d'erreur XML standardisés
 */
export const XML_ERROR_CODES = {
  // Erreurs de syntaxe
  INVALID_CHARACTER: 'INVALID_CHARACTER',
  MALFORMED_TAG: 'MALFORMED_TAG',
  UNCLOSED_TAG: 'UNCLOSED_TAG',
  MISMATCHED_TAG: 'MISMATCHED_TAG',
  DUPLICATE_ATTRIBUTE: 'DUPLICATE_ATTRIBUTE',
  INVALID_ATTRIBUTE: 'INVALID_ATTRIBUTE',

  // Erreurs de structure
  MISSING_ROOT: 'MISSING_ROOT',
  MULTIPLE_ROOTS: 'MULTIPLE_ROOTS',
  INVALID_NESTING: 'INVALID_NESTING',

  // Erreurs de contenu
  INVALID_CDATA: 'INVALID_CDATA',
  INVALID_COMMENT: 'INVALID_COMMENT',
  INVALID_PI: 'INVALID_PI',
  INVALID_DOCTYPE: 'INVALID_DOCTYPE',

  // Erreurs de namespace
  INVALID_NAMESPACE: 'INVALID_NAMESPACE',
  UNDEFINED_PREFIX: 'UNDEFINED_PREFIX',
  XMLNS_PREFIX_RESERVED: 'XMLNS_PREFIX_RESERVED',
  XML_PREFIX_URI: 'XML_PREFIX_URI',
  BAD_QNAME: 'BAD_QNAME',
  ATTR_MISSING_SPACE: 'ATTR_MISSING_SPACE',
  ATTR_NO_VALUE: 'ATTR_NO_VALUE',

  // Erreurs de sécurité
  ENTITY_EXPANSION_LIMIT: 'ENTITY_EXPANSION_LIMIT',
  MAX_DEPTH_EXCEEDED: 'MAX_DEPTH_EXCEEDED',
  MAX_TEXT_LENGTH_EXCEEDED: 'MAX_TEXT_LENGTH_EXCEEDED',

  // Erreurs de récupération
  RECOVERY_ATTEMPTED: 'RECOVERY_ATTEMPTED',
  PARTIAL_PARSE: 'PARTIAL_PARSE',
} as const;

/**
 * Messages d'erreur par défaut
 */
export const XML_ERROR_MESSAGES = {
  [XML_ERROR_CODES.INVALID_CHARACTER]: 'Caractère invalide dans le XML',
  [XML_ERROR_CODES.MALFORMED_TAG]: 'Balise malformée',
  [XML_ERROR_CODES.UNCLOSED_TAG]: 'Balise non fermée',
  [XML_ERROR_CODES.MISMATCHED_TAG]: 'Balises non appariées',
  [XML_ERROR_CODES.DUPLICATE_ATTRIBUTE]: 'Attribut dupliqué',
  [XML_ERROR_CODES.INVALID_ATTRIBUTE]: 'Attribut invalide',
  [XML_ERROR_CODES.MISSING_ROOT]: 'Élément racine manquant',
  [XML_ERROR_CODES.MULTIPLE_ROOTS]: 'Plusieurs éléments racines',
  [XML_ERROR_CODES.INVALID_NESTING]: 'Imbrication invalide',
  [XML_ERROR_CODES.INVALID_CDATA]: 'Section CDATA invalide',
  [XML_ERROR_CODES.INVALID_COMMENT]: 'Commentaire invalide',
  [XML_ERROR_CODES.INVALID_PI]: 'Instruction de traitement invalide',
  [XML_ERROR_CODES.INVALID_DOCTYPE]: 'Déclaration DOCTYPE invalide',
  [XML_ERROR_CODES.INVALID_NAMESPACE]: 'Namespace invalide',
  [XML_ERROR_CODES.UNDEFINED_PREFIX]: 'Préfixe non défini',
  [XML_ERROR_CODES.XMLNS_PREFIX_RESERVED]: 'Le préfixe "xmlns" est réservé',
  [XML_ERROR_CODES.XML_PREFIX_URI]: 'Le préfixe "xml" doit être lié à l\'URI standard',
  [XML_ERROR_CODES.BAD_QNAME]: 'Nom qualifié (QName) invalide',
  [XML_ERROR_CODES.ATTR_MISSING_SPACE]: 'Espace requis après la valeur de l\'attribut',
  [XML_ERROR_CODES.ATTR_NO_VALUE]: 'Attribut sans valeur ou valeur non quotée',
  [XML_ERROR_CODES.ENTITY_EXPANSION_LIMIT]: "Limite d'expansion d'entité dépassée",
  [XML_ERROR_CODES.MAX_DEPTH_EXCEEDED]: 'Profondeur maximale dépassée',
  [XML_ERROR_CODES.MAX_TEXT_LENGTH_EXCEEDED]: 'Longueur de texte maximale dépassée',
  [XML_ERROR_CODES.RECOVERY_ATTEMPTED]: 'Tentative de récupération',
  [XML_ERROR_CODES.PARTIAL_PARSE]: 'Parse partiel effectué',
} as const;

/**
 * Suggestions de correction par défaut
 */
export const XML_ERROR_SUGGESTIONS = {
  [XML_ERROR_CODES.INVALID_CHARACTER]: "Vérifiez l'encodage du fichier",
  [XML_ERROR_CODES.MALFORMED_TAG]: 'Vérifiez la syntaxe de la balise',
  [XML_ERROR_CODES.UNCLOSED_TAG]: 'Ajoutez la balise de fermeture correspondante',
  [XML_ERROR_CODES.MISMATCHED_TAG]: "Vérifiez l'appariement des balises",
  [XML_ERROR_CODES.DUPLICATE_ATTRIBUTE]: "Supprimez l'attribut dupliqué",
  [XML_ERROR_CODES.INVALID_ATTRIBUTE]: "Vérifiez la syntaxe de l'attribut",
  [XML_ERROR_CODES.MISSING_ROOT]: 'Ajoutez un élément racine',
  [XML_ERROR_CODES.MULTIPLE_ROOTS]: 'Supprimez les éléments racines supplémentaires',
  [XML_ERROR_CODES.INVALID_NESTING]: "Vérifiez l'imbrication des éléments",
  [XML_ERROR_CODES.INVALID_CDATA]: 'Vérifiez la syntaxe CDATA',
  [XML_ERROR_CODES.INVALID_COMMENT]: 'Vérifiez la syntaxe du commentaire',
  [XML_ERROR_CODES.INVALID_PI]: "Vérifiez la syntaxe de l'instruction de traitement",
  [XML_ERROR_CODES.INVALID_DOCTYPE]: 'Vérifiez la syntaxe DOCTYPE',
  [XML_ERROR_CODES.INVALID_NAMESPACE]: 'Vérifiez la déclaration du namespace',
  [XML_ERROR_CODES.UNDEFINED_PREFIX]: 'Définissez le préfixe ou utilisez xmlns',
  [XML_ERROR_CODES.XMLNS_PREFIX_RESERVED]: 'N\'utilisez pas "xmlns" comme préfixe applicatif',
  [XML_ERROR_CODES.XML_PREFIX_URI]: 'Utilisez http://www.w3.org/XML/1998/namespace pour "xml"',
  [XML_ERROR_CODES.BAD_QNAME]: 'Limitez le QName à un seul ":" et un nom valide',
  [XML_ERROR_CODES.ATTR_MISSING_SPACE]: 'Ajoutez un espace avant le prochain attribut',
  [XML_ERROR_CODES.ATTR_NO_VALUE]: 'Entourez la valeur d\'apostrophes ou guillemets',
  [XML_ERROR_CODES.ENTITY_EXPANSION_LIMIT]: 'Réduisez la complexité des entités',
  [XML_ERROR_CODES.MAX_DEPTH_EXCEEDED]: "Réduisez la profondeur d'imbrication",
  [XML_ERROR_CODES.MAX_TEXT_LENGTH_EXCEEDED]: 'Réduisez la longueur du texte',
  [XML_ERROR_CODES.RECOVERY_ATTEMPTED]: 'Le parser a tenté de récupérer automatiquement',
  [XML_ERROR_CODES.PARTIAL_PARSE]: 'Le parsing a été effectué partiellement',
} as const;
