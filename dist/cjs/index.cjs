"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuciformXMLParser = void 0;
const scanner_1 = require("./scanner");
const document_1 = require("./document");
const diagnostics_1 = require("./diagnostics");
const document_2 = require("./document");
class LuciformXMLParser {
    constructor(content, options = {}) {
        this.content = content;
        this.maxDepth = options.maxDepth || 50;
        this.maxTextLength = options.maxTextLength || 100000;
        this.entityExpansionLimit = options.entityExpansionLimit || 1000;
        this.allowDTD = options.allowDTD || false;
        this.maxAttrCount = options.maxAttrCount || 100;
        this.maxAttrValueLength = options.maxAttrValueLength || 10000;
        this.maxCommentLength = options.maxCommentLength || 10000;
        this.maxPILength = options.maxPILength || 1000;
        this.useUnicodeNames = options.useUnicodeNames || true;
        this.mode = options.mode || 'luciform-permissive';
    }
    /**
     * Parse le XML avec mode Luciform-permissif
     */
    parse() {
        const diagnosticManager = new diagnostics_1.DiagnosticManager();
        let document;
        let nodeCount = 0;
        try {
            const scanner = new scanner_1.LuciformXMLScanner(this.content);
            document = this.parseDocument(scanner, diagnosticManager);
            nodeCount = this.countNodes(document);
        }
        catch (error) {
            diagnosticManager.addError(diagnostics_1.XML_ERROR_CODES.PARTIAL_PARSE, `Erreur de parsing: ${error}`, undefined, 'Vérifiez la syntaxe XML');
        }
        const diagnostics = diagnosticManager.getDiagnostics();
        const errors = diagnosticManager.getErrors();
        const recoveryCount = diagnosticManager.getRecoveryCount();
        return {
            success: errors.length === 0,
            document,
            errors,
            diagnostics,
            recoveryCount,
            nodeCount
        };
    }
    /**
     * Parse un document XML complet
     */
    parseDocument(scanner, diagnostics) {
        const document = new document_1.XMLDocument();
        let token;
        while ((token = scanner.next()) !== null) {
            switch (token.type) {
                case 'PI':
                    if (token.content?.startsWith('xml')) {
                        const declaration = this.parseDeclaration(token, diagnostics);
                        if (declaration) {
                            document.declaration = declaration;
                        }
                    }
                    else {
                        // Autres instructions de traitement
                        this.addProcessingInstruction(document, token, diagnostics);
                    }
                    break;
                case 'Doctype':
                    const doctype = this.parseDoctype(token, diagnostics);
                    if (doctype) {
                        document.doctype = doctype;
                    }
                    break;
                case 'StartTag':
                    const element = this.parseElement(scanner, token, diagnostics, 0);
                    if (element) {
                        document.addChild(element);
                    }
                    break;
                case 'Text':
                    if (token.content?.trim()) {
                        this.addTextNode(document, token, diagnostics);
                    }
                    break;
                case 'Comment':
                    this.addCommentNode(document, token, diagnostics);
                    break;
                case 'CDATA':
                    this.addCDATANode(document, token, diagnostics);
                    break;
            }
        }
        return document;
    }
    /**
     * Parse une déclaration XML
     */
    parseDeclaration(token, diagnostics) {
        const content = token.content || '';
        const parts = content.split(/\s+/);
        let version;
        let encoding;
        let standalone;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part === 'version' && i + 1 < parts.length) {
                version = parts[i + 1].replace(/['"]/g, '');
            }
            else if (part === 'encoding' && i + 1 < parts.length) {
                encoding = parts[i + 1].replace(/['"]/g, '');
            }
            else if (part === 'standalone' && i + 1 < parts.length) {
                standalone = parts[i + 1].replace(/['"]/g, '') === 'yes';
            }
        }
        return new document_1.XMLDeclaration(version, encoding, standalone, token.location);
    }
    /**
     * Parse une déclaration DOCTYPE
     */
    parseDoctype(token, diagnostics) {
        const content = token.content || '';
        const parts = content.split(/\s+/);
        const name = parts[0];
        let publicId;
        let systemId;
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            if (part === 'PUBLIC' && i + 1 < parts.length) {
                publicId = parts[i + 1].replace(/['"]/g, '');
            }
            else if (part === 'SYSTEM' && i + 1 < parts.length) {
                systemId = parts[i + 1].replace(/['"]/g, '');
            }
        }
        return new document_1.XMLDoctype(name, publicId, systemId, token.location);
    }
    /**
     * Parse un élément XML
     */
    parseElement(scanner, startToken, diagnostics, depth) {
        if (depth > this.maxDepth) {
            diagnostics.addError(diagnostics_1.XML_ERROR_CODES.MAX_DEPTH_EXCEEDED, `Profondeur maximale dépassée: ${depth}`, startToken.location);
            return null;
        }
        const element = new document_1.XMLElement(startToken.tagName || '', startToken.location);
        // Ajouter les attributs
        if (startToken.attributes) {
            for (const [name, value] of startToken.attributes) {
                element.setAttribute(name, value);
            }
        }
        // Si auto-fermant, on a fini
        if (startToken.selfClosing) {
            return element;
        }
        // Parser les enfants
        let token;
        while ((token = scanner.next()) !== null) {
            switch (token.type) {
                case 'StartTag':
                    const childElement = this.parseElement(scanner, token, diagnostics, depth + 1);
                    if (childElement) {
                        element.addChild(childElement);
                    }
                    break;
                case 'EndTag':
                    if (token.tagName === element.name) {
                        element.closed = true;
                        return element;
                    }
                    else {
                        diagnostics.addError(diagnostics_1.XML_ERROR_CODES.MISMATCHED_TAG, `Balises non appariées: ${element.name} vs ${token.tagName}`, token.location, `Fermez la balise ${element.name}`);
                        diagnostics.incrementRecovery();
                    }
                    break;
                case 'Text':
                    if (token.content?.trim()) {
                        const textNode = new document_2.XMLNode('text', token.content, token.location);
                        element.addChild(textNode);
                    }
                    break;
                case 'Comment':
                    this.addCommentNode(element, token, diagnostics);
                    break;
                case 'CDATA':
                    this.addCDATANode(element, token, diagnostics);
                    break;
            }
        }
        // Balise non fermée
        if (!element.closed) {
            diagnostics.addError(diagnostics_1.XML_ERROR_CODES.UNCLOSED_TAG, `Balise non fermée: ${element.name}`, startToken.location, `Ajoutez </${element.name}>`);
            diagnostics.incrementRecovery();
        }
        return element;
    }
    /**
     * Ajoute un nœud de texte
     */
    addTextNode(parent, token, diagnostics) {
        const content = token.content || '';
        if (content.length > this.maxTextLength) {
            diagnostics.addError(diagnostics_1.XML_ERROR_CODES.MAX_TEXT_LENGTH_EXCEEDED, `Longueur de texte maximale dépassée: ${content.length}`, token.location);
            return;
        }
        const textNode = new document_2.XMLNode('text', content, token.location);
        parent.addChild(textNode);
    }
    /**
     * Ajoute un nœud de commentaire
     */
    addCommentNode(parent, token, diagnostics) {
        const content = token.content || '';
        if (content.length > this.maxCommentLength) {
            diagnostics.addError(diagnostics_1.XML_ERROR_CODES.MAX_TEXT_LENGTH_EXCEEDED, `Longueur de commentaire maximale dépassée: ${content.length}`, token.location);
            return;
        }
        if (!token.closed) {
            diagnostics.addWarning(diagnostics_1.XML_ERROR_CODES.INVALID_COMMENT, 'Commentaire non fermé correctement', token.location, 'Utilisez --> pour fermer le commentaire');
            diagnostics.incrementRecovery();
        }
        const commentNode = new document_2.XMLNode('comment', content, token.location);
        parent.addChild(commentNode);
    }
    /**
     * Ajoute un nœud CDATA
     */
    addCDATANode(parent, token, diagnostics) {
        const content = token.content || '';
        if (!token.closed) {
            diagnostics.addError(diagnostics_1.XML_ERROR_CODES.INVALID_CDATA, 'Section CDATA non fermée correctement', token.location, 'Utilisez ]]> pour fermer la section CDATA');
            diagnostics.incrementRecovery();
        }
        const cdataNode = new document_2.XMLNode('cdata', content, token.location);
        parent.addChild(cdataNode);
    }
    /**
     * Ajoute une instruction de traitement
     */
    addProcessingInstruction(parent, token, diagnostics) {
        const content = token.content || '';
        if (content.length > this.maxPILength) {
            diagnostics.addError(diagnostics_1.XML_ERROR_CODES.MAX_TEXT_LENGTH_EXCEEDED, `Longueur d'instruction maximale dépassée: ${content.length}`, token.location);
            return;
        }
        if (!token.closed) {
            diagnostics.addWarning(diagnostics_1.XML_ERROR_CODES.INVALID_PI, 'Instruction de traitement non fermée correctement', token.location, 'Utilisez ?> pour fermer l\'instruction');
            diagnostics.incrementRecovery();
        }
        const piNode = new document_2.XMLNode('pi', content, token.location);
        parent.addChild(piNode);
    }
    /**
     * Compte le nombre de nœuds dans le document
     */
    countNodes(document) {
        let count = 0;
        const countRecursive = (node) => {
            count++;
            if (node.children) {
                for (const child of node.children) {
                    countRecursive(child);
                }
            }
        };
        for (const child of document.children) {
            countRecursive(child);
        }
        return count;
    }
}
exports.LuciformXMLParser = LuciformXMLParser;
// Réexporter les classes/utilitaires principaux (éviter les conflits de noms avec ./types)
__exportStar(require("./scanner"), exports);
__exportStar(require("./document"), exports);
__exportStar(require("./diagnostics"), exports);
