/**
 * LuciformXMLParser - Parser XML de niveau recherche (Refactorisé)
 *
 * Marque de fabrique Luciform Research :
 * - Tokenizer à états robuste
 * - Parser SAX avec mode permissif
 * - Gestion complète des attributs et nœuds spéciaux
 * - Sécurité anti-DoS/XXE
 * - Diagnostics précis (ligne/colonne)
 * - Mode "Luciform-permissif" pour récupération d'erreurs
 *
 * Architecture modulaire refactorisée pour une meilleure maintenabilité
 */
import { ParseResult, ParserOptions } from './types';
export declare class LuciformXMLParser {
    private content;
    private maxDepth;
    private maxTextLength;
    private entityExpansionLimit;
    private allowDTD;
    private maxAttrCount;
    private maxAttrValueLength;
    private maxCommentLength;
    private maxPILength;
    private useUnicodeNames;
    private mode;
    private maxRecoveries?;
    constructor(content: string, options?: ParserOptions);
    /**
     * Parse le XML avec mode Luciform-permissif
     */
    parse(): ParseResult;
    /**
     * Parse un document XML complet
     */
    private parseDocument;
    /**
     * Parse une déclaration XML
     */
    private parseDeclaration;
    /**
     * Parse une déclaration DOCTYPE
     */
    private parseDoctype;
    /**
     * Parse un élément XML
     */
    private parseElement;
    /**
     * Ajoute un nœud de texte
     */
    private addTextNode;
    /**
     * Ajoute un nœud de commentaire
     */
    private addCommentNode;
    /**
     * Ajoute un nœud CDATA
     */
    private addCDATANode;
    /**
     * Ajoute une instruction de traitement
     */
    private addProcessingInstruction;
    /**
     * Compte le nombre de nœuds dans le document
     */
    private countNodes;
}
export * from './scanner';
export * from './document';
export * from './diagnostics';
