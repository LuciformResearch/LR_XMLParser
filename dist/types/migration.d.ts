/**
 * Migration - Compatibilité avec l'ancien LuciformXMLParser
 *
 * Fournit une interface de compatibilité pour migrer progressivement
 * de l'ancien parser vers la nouvelle architecture modulaire
 */
import { ParserOptions, ParseResult } from './types';
/**
 * Interface de compatibilité avec l'ancien parser
 *
 * Cette classe maintient la même API que l'ancien LuciformXMLParser
 * mais utilise la nouvelle architecture modulaire en arrière-plan
 */
export declare class LuciformXMLParserCompat {
    private parser;
    constructor(content: string, options?: ParserOptions);
    /**
     * Parse le XML (interface compatible)
     */
    parse(): ParseResult;
    /**
     * Obtient les diagnostics (interface compatible)
     */
    getDiagnostics(): import("./types").Diagnostic[];
    /**
     * Obtient les erreurs (interface compatible)
     */
    getErrors(): import("./types").Diagnostic[];
    /**
     * Obtient le nombre de récupérations (interface compatible)
     */
    getRecoveryCount(): number;
    /**
     * Obtient le nombre de nœuds (interface compatible)
     */
    getNodeCount(): number;
}
/**
 * Fonction de migration automatique
 *
 * Remplace automatiquement les imports de l'ancien parser
 * par le nouveau parser modulaire
 */
export declare function migrateToNewParser(): string[];
/**
 * Test de compatibilité
 */
export declare function testCompatibility(): boolean;
