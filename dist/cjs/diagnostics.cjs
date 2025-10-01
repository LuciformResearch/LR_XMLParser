"use strict";
/**
 * Diagnostics - Gestion des erreurs et avertissements XML
 *
 * Système de diagnostic pour le parser XML avec codes d'erreur
 * et suggestions de correction
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.XML_ERROR_SUGGESTIONS = exports.XML_ERROR_MESSAGES = exports.XML_ERROR_CODES = exports.DiagnosticManager = void 0;
class DiagnosticManager {
    constructor() {
        this.diagnostics = [];
        this.errors = [];
        this.recoveryCount = 0;
    }
    /**
     * Ajoute un diagnostic
     */
    addDiagnostic(diagnostic) {
        this.diagnostics.push(diagnostic);
        if (diagnostic.level === 'error') {
            this.errors.push(diagnostic);
        }
    }
    /**
     * Ajoute une erreur
     */
    addError(code, message, location, suggestion) {
        this.addDiagnostic({
            level: 'error',
            code,
            message,
            location,
            suggestion
        });
    }
    /**
     * Ajoute un avertissement
     */
    addWarning(code, message, location, suggestion) {
        this.addDiagnostic({
            level: 'warn',
            code,
            message,
            location,
            suggestion
        });
    }
    /**
     * Ajoute une info
     */
    addInfo(code, message, location, suggestion) {
        this.addDiagnostic({
            level: 'info',
            code,
            message,
            location,
            suggestion
        });
    }
    /**
     * Incrémente le compteur de récupération
     */
    incrementRecovery() {
        this.recoveryCount++;
    }
    /**
     * Obtient tous les diagnostics
     */
    getDiagnostics() {
        return [...this.diagnostics];
    }
    /**
     * Obtient les erreurs
     */
    getErrors() {
        return [...this.errors];
    }
    /**
     * Obtient les avertissements
     */
    getWarnings() {
        return this.diagnostics.filter(d => d.level === 'warn');
    }
    /**
     * Obtient les infos
     */
    getInfos() {
        return this.diagnostics.filter(d => d.level === 'info');
    }
    /**
     * Obtient le nombre de récupérations
     */
    getRecoveryCount() {
        return this.recoveryCount;
    }
    /**
     * Vérifie s'il y a des erreurs
     */
    hasErrors() {
        return this.errors.length > 0;
    }
    /**
     * Vérifie s'il y a des avertissements
     */
    hasWarnings() {
        return this.getWarnings().length > 0;
    }
    /**
     * Remet à zéro les diagnostics
     */
    reset() {
        this.diagnostics = [];
        this.errors = [];
        this.recoveryCount = 0;
    }
    /**
     * Obtient un résumé des diagnostics
     */
    getSummary() {
        return {
            total: this.diagnostics.length,
            errors: this.errors.length,
            warnings: this.getWarnings().length,
            infos: this.getInfos().length,
            recoveries: this.recoveryCount
        };
    }
}
exports.DiagnosticManager = DiagnosticManager;
/**
 * Codes d'erreur XML standardisés
 */
exports.XML_ERROR_CODES = {
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
    // Erreurs de sécurité
    ENTITY_EXPANSION_LIMIT: 'ENTITY_EXPANSION_LIMIT',
    MAX_DEPTH_EXCEEDED: 'MAX_DEPTH_EXCEEDED',
    MAX_TEXT_LENGTH_EXCEEDED: 'MAX_TEXT_LENGTH_EXCEEDED',
    // Erreurs de récupération
    RECOVERY_ATTEMPTED: 'RECOVERY_ATTEMPTED',
    PARTIAL_PARSE: 'PARTIAL_PARSE'
};
/**
 * Messages d'erreur par défaut
 */
exports.XML_ERROR_MESSAGES = {
    [exports.XML_ERROR_CODES.INVALID_CHARACTER]: 'Caractère invalide dans le XML',
    [exports.XML_ERROR_CODES.MALFORMED_TAG]: 'Balise malformée',
    [exports.XML_ERROR_CODES.UNCLOSED_TAG]: 'Balise non fermée',
    [exports.XML_ERROR_CODES.MISMATCHED_TAG]: 'Balises non appariées',
    [exports.XML_ERROR_CODES.DUPLICATE_ATTRIBUTE]: 'Attribut dupliqué',
    [exports.XML_ERROR_CODES.INVALID_ATTRIBUTE]: 'Attribut invalide',
    [exports.XML_ERROR_CODES.MISSING_ROOT]: 'Élément racine manquant',
    [exports.XML_ERROR_CODES.MULTIPLE_ROOTS]: 'Plusieurs éléments racines',
    [exports.XML_ERROR_CODES.INVALID_NESTING]: 'Imbrication invalide',
    [exports.XML_ERROR_CODES.INVALID_CDATA]: 'Section CDATA invalide',
    [exports.XML_ERROR_CODES.INVALID_COMMENT]: 'Commentaire invalide',
    [exports.XML_ERROR_CODES.INVALID_PI]: 'Instruction de traitement invalide',
    [exports.XML_ERROR_CODES.INVALID_DOCTYPE]: 'Déclaration DOCTYPE invalide',
    [exports.XML_ERROR_CODES.INVALID_NAMESPACE]: 'Namespace invalide',
    [exports.XML_ERROR_CODES.UNDEFINED_PREFIX]: 'Préfixe non défini',
    [exports.XML_ERROR_CODES.ENTITY_EXPANSION_LIMIT]: 'Limite d\'expansion d\'entité dépassée',
    [exports.XML_ERROR_CODES.MAX_DEPTH_EXCEEDED]: 'Profondeur maximale dépassée',
    [exports.XML_ERROR_CODES.MAX_TEXT_LENGTH_EXCEEDED]: 'Longueur de texte maximale dépassée',
    [exports.XML_ERROR_CODES.RECOVERY_ATTEMPTED]: 'Tentative de récupération',
    [exports.XML_ERROR_CODES.PARTIAL_PARSE]: 'Parse partiel effectué'
};
/**
 * Suggestions de correction par défaut
 */
exports.XML_ERROR_SUGGESTIONS = {
    [exports.XML_ERROR_CODES.INVALID_CHARACTER]: 'Vérifiez l\'encodage du fichier',
    [exports.XML_ERROR_CODES.MALFORMED_TAG]: 'Vérifiez la syntaxe de la balise',
    [exports.XML_ERROR_CODES.UNCLOSED_TAG]: 'Ajoutez la balise de fermeture correspondante',
    [exports.XML_ERROR_CODES.MISMATCHED_TAG]: 'Vérifiez l\'appariement des balises',
    [exports.XML_ERROR_CODES.DUPLICATE_ATTRIBUTE]: 'Supprimez l\'attribut dupliqué',
    [exports.XML_ERROR_CODES.INVALID_ATTRIBUTE]: 'Vérifiez la syntaxe de l\'attribut',
    [exports.XML_ERROR_CODES.MISSING_ROOT]: 'Ajoutez un élément racine',
    [exports.XML_ERROR_CODES.MULTIPLE_ROOTS]: 'Supprimez les éléments racines supplémentaires',
    [exports.XML_ERROR_CODES.INVALID_NESTING]: 'Vérifiez l\'imbrication des éléments',
    [exports.XML_ERROR_CODES.INVALID_CDATA]: 'Vérifiez la syntaxe CDATA',
    [exports.XML_ERROR_CODES.INVALID_COMMENT]: 'Vérifiez la syntaxe du commentaire',
    [exports.XML_ERROR_CODES.INVALID_PI]: 'Vérifiez la syntaxe de l\'instruction de traitement',
    [exports.XML_ERROR_CODES.INVALID_DOCTYPE]: 'Vérifiez la syntaxe DOCTYPE',
    [exports.XML_ERROR_CODES.INVALID_NAMESPACE]: 'Vérifiez la déclaration du namespace',
    [exports.XML_ERROR_CODES.UNDEFINED_PREFIX]: 'Définissez le préfixe ou utilisez xmlns',
    [exports.XML_ERROR_CODES.ENTITY_EXPANSION_LIMIT]: 'Réduisez la complexité des entités',
    [exports.XML_ERROR_CODES.MAX_DEPTH_EXCEEDED]: 'Réduisez la profondeur d\'imbrication',
    [exports.XML_ERROR_CODES.MAX_TEXT_LENGTH_EXCEEDED]: 'Réduisez la longueur du texte',
    [exports.XML_ERROR_CODES.RECOVERY_ATTEMPTED]: 'Le parser a tenté de récupérer automatiquement',
    [exports.XML_ERROR_CODES.PARTIAL_PARSE]: 'Le parsing a été effectué partiellement'
};
