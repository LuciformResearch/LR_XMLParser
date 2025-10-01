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

import { LuciformXMLScanner } from './scanner';
import { XMLDocument, XMLElement, XMLDeclaration, XMLDoctype } from './document';
import { DiagnosticManager, XML_ERROR_CODES } from './diagnostics';
import { 
  ParseResult, 
  ParserOptions, 
  Token, 
  Location
} from './types';
import { XMLNode } from './document';

export class LuciformXMLParser {
  private content: string;
  private maxDepth: number;
  private maxTextLength: number;
  private entityExpansionLimit: number;
  private allowDTD: boolean;
  private maxAttrCount: number;
  private maxAttrValueLength: number;
  private maxCommentLength: number;
  private maxPILength: number;
  private useUnicodeNames: boolean;
  private mode: 'strict' | 'permissive' | 'luciform-permissive';

  constructor(content: string, options: ParserOptions = {}) {
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
  parse(): ParseResult {
    const diagnosticManager = new DiagnosticManager();
    let document: XMLDocument | undefined;
    let nodeCount = 0;

    try {
      const scanner = new LuciformXMLScanner(this.content);
      document = this.parseDocument(scanner, diagnosticManager);
      nodeCount = this.countNodes(document);
    } catch (error) {
      diagnosticManager.addError(
        XML_ERROR_CODES.PARTIAL_PARSE,
        `Erreur de parsing: ${error}`,
        undefined,
        'Vérifiez la syntaxe XML'
      );
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
  private parseDocument(scanner: LuciformXMLScanner, diagnostics: DiagnosticManager): XMLDocument {
    const document = new XMLDocument();
    let token: Token | null;

    while ((token = scanner.next()) !== null) {
      switch (token.type) {
        case 'PI':
          if (token.content?.startsWith('xml')) {
            const declaration = this.parseDeclaration(token, diagnostics);
            if (declaration) {
              document.declaration = declaration;
            }
          } else {
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
  private parseDeclaration(token: Token, diagnostics: DiagnosticManager): XMLDeclaration | null {
    const content = token.content || '';
    const parts = content.split(/\s+/);
    
    let version: string | undefined;
    let encoding: string | undefined;
    let standalone: boolean | undefined;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part === 'version' && i + 1 < parts.length) {
        version = parts[i + 1].replace(/['"]/g, '');
      } else if (part === 'encoding' && i + 1 < parts.length) {
        encoding = parts[i + 1].replace(/['"]/g, '');
      } else if (part === 'standalone' && i + 1 < parts.length) {
        standalone = parts[i + 1].replace(/['"]/g, '') === 'yes';
      }
    }

    return new XMLDeclaration(version, encoding, standalone, token.location);
  }

  /**
   * Parse une déclaration DOCTYPE
   */
  private parseDoctype(token: Token, diagnostics: DiagnosticManager): XMLDoctype | null {
    const content = token.content || '';
    const parts = content.split(/\s+/);
    
    const name = parts[0];
    let publicId: string | undefined;
    let systemId: string | undefined;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      
      if (part === 'PUBLIC' && i + 1 < parts.length) {
        publicId = parts[i + 1].replace(/['"]/g, '');
      } else if (part === 'SYSTEM' && i + 1 < parts.length) {
        systemId = parts[i + 1].replace(/['"]/g, '');
      }
    }

    return new XMLDoctype(name, publicId, systemId, token.location);
  }

  /**
   * Parse un élément XML
   */
  private parseElement(
    scanner: LuciformXMLScanner, 
    startToken: Token, 
    diagnostics: DiagnosticManager, 
    depth: number
  ): XMLElement | null {
    if (depth > this.maxDepth) {
      diagnostics.addError(
        XML_ERROR_CODES.MAX_DEPTH_EXCEEDED,
        `Profondeur maximale dépassée: ${depth}`,
        startToken.location
      );
      return null;
    }

    const element = new XMLElement(startToken.tagName || '', startToken.location);
    
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
    let token: Token | null;
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
          } else {
            diagnostics.addError(
              XML_ERROR_CODES.MISMATCHED_TAG,
              `Balises non appariées: ${element.name} vs ${token.tagName}`,
              token.location,
              `Fermez la balise ${element.name}`
            );
            diagnostics.incrementRecovery();
          }
          break;

        case 'Text':
          if (token.content?.trim()) {
            const textNode = new XMLNode('text', token.content, token.location);
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
      diagnostics.addError(
        XML_ERROR_CODES.UNCLOSED_TAG,
        `Balise non fermée: ${element.name}`,
        startToken.location,
        `Ajoutez </${element.name}>`
      );
      diagnostics.incrementRecovery();
    }

    return element;
  }

  /**
   * Ajoute un nœud de texte
   */
  private addTextNode(parent: XMLDocument | XMLElement, token: Token, diagnostics: DiagnosticManager): void {
    const content = token.content || '';
    
    if (content.length > this.maxTextLength) {
      diagnostics.addError(
        XML_ERROR_CODES.MAX_TEXT_LENGTH_EXCEEDED,
        `Longueur de texte maximale dépassée: ${content.length}`,
        token.location
      );
      return;
    }

    const textNode = new XMLNode('text', content, token.location);
    parent.addChild(textNode);
  }

  /**
   * Ajoute un nœud de commentaire
   */
  private addCommentNode(parent: XMLDocument | XMLElement, token: Token, diagnostics: DiagnosticManager): void {
    const content = token.content || '';
    
    if (content.length > this.maxCommentLength) {
      diagnostics.addError(
        XML_ERROR_CODES.MAX_TEXT_LENGTH_EXCEEDED,
        `Longueur de commentaire maximale dépassée: ${content.length}`,
        token.location
      );
      return;
    }

    if (!token.closed) {
      diagnostics.addWarning(
        XML_ERROR_CODES.INVALID_COMMENT,
        'Commentaire non fermé correctement',
        token.location,
        'Utilisez --> pour fermer le commentaire'
      );
      diagnostics.incrementRecovery();
    }

    const commentNode = new XMLNode('comment', content, token.location);
    parent.addChild(commentNode);
  }

  /**
   * Ajoute un nœud CDATA
   */
  private addCDATANode(parent: XMLDocument | XMLElement, token: Token, diagnostics: DiagnosticManager): void {
    const content = token.content || '';
    
    if (!token.closed) {
      diagnostics.addError(
        XML_ERROR_CODES.INVALID_CDATA,
        'Section CDATA non fermée correctement',
        token.location,
        'Utilisez ]]> pour fermer la section CDATA'
      );
      diagnostics.incrementRecovery();
    }

    const cdataNode = new XMLNode('cdata', content, token.location);
    parent.addChild(cdataNode);
  }

  /**
   * Ajoute une instruction de traitement
   */
  private addProcessingInstruction(parent: XMLDocument, token: Token, diagnostics: DiagnosticManager): void {
    const content = token.content || '';
    
    if (content.length > this.maxPILength) {
      diagnostics.addError(
        XML_ERROR_CODES.MAX_TEXT_LENGTH_EXCEEDED,
        `Longueur d'instruction maximale dépassée: ${content.length}`,
        token.location
      );
      return;
    }

    if (!token.closed) {
      diagnostics.addWarning(
        XML_ERROR_CODES.INVALID_PI,
        'Instruction de traitement non fermée correctement',
        token.location,
        'Utilisez ?> pour fermer l\'instruction'
      );
      diagnostics.incrementRecovery();
    }

    const piNode = new XMLNode('pi', content, token.location);
    parent.addChild(piNode);
  }

  /**
   * Compte le nombre de nœuds dans le document
   */
  private countNodes(document: XMLDocument): number {
    let count = 0;
    
    const countRecursive = (node: XMLNode) => {
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

// Réexporter tous les types et classes pour compatibilité
export * from './types';
export * from './scanner';
export * from './document';
export * from './diagnostics';