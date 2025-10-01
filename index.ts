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
import { ParseResult, ParserOptions, Token } from './types';
import type { Location } from './types';
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
  private maxRecoveries?: number;
  private recoveryStopIssued: boolean = false;
  private coalesceTextNodes: boolean;

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
    this.maxRecoveries = options.maxRecoveries;
    this.coalesceTextNodes = options.coalesceTextNodes ?? true;
  }

  /**
   * Parse le XML avec mode Luciform-permissif
   */
  parse(): ParseResult {
    const diagnosticManager = new DiagnosticManager();
    diagnosticManager.setRecoveryCap(this.maxRecoveries);
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
    const recoveryReport = diagnosticManager.getRecoveryReport();

    return {
      success: errors.length === 0,
      document,
      errors,
      diagnostics,
      recoveryCount,
      nodeCount,
      recoveryReport,
    };
  }

  private maybeStopOnRecoveryCap(diagnostics: DiagnosticManager, location?: Location): boolean {
    const capped = diagnostics.isRecoveryCapped();
    if (capped && !this.recoveryStopIssued) {
      const report = diagnostics.getRecoveryReport();
      diagnostics.addInfo(
        XML_ERROR_CODES.RECOVERY_ATTEMPTED,
        `Tentative de récupération: limite maxRecoveries dépassée après ${report.attempts} corrections`,
        location
      );
      diagnostics.addRecoveryNote('maxRecoveries exceeded: stopping further scanning');
      diagnostics.addInfo(
        XML_ERROR_CODES.PARTIAL_PARSE,
        'Parsing arrêté après dépassement de la limite de récupération',
        location,
        'Augmentez maxRecoveries pour autoriser davantage de corrections'
      );
      diagnostics.addRecoveryNote('partial parse returned due to recovery cap');
      this.recoveryStopIssued = true;
    }
    return capped;
  }

  /**
   * Parse un document XML complet
   */
  private parseDocument(scanner: LuciformXMLScanner, diagnostics: DiagnosticManager): XMLDocument {
    const document = new XMLDocument();
    let token: Token | null;
    // Base namespace frame
    const baseNS = new Map<string, string>([['xml', 'http://www.w3.org/XML/1998/namespace']]);

    while ((token = scanner.next()) !== null) {
      if (this.maybeStopOnRecoveryCap(diagnostics, token.location)) {
        break;
      }
      switch (token.type) {
        case 'PI': {
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
        }

        case 'Doctype': {
          const doctype = this.parseDoctype(token, diagnostics);
          if (doctype) {
            document.doctype = doctype;
          }
          break;
        }

        case 'StartTag': {
          const element = this.parseElement(scanner, token, diagnostics, 0, baseNS);
          if (element) {
            document.addChild(element);
          }
          if (this.maybeStopOnRecoveryCap(diagnostics, token.location)) {
            // Arrêt contrôlé au niveau document
            token = null;
          }
          break;
        }

        case 'Text': {
          if (token.content?.trim()) {
            this.addTextNode(document, token, diagnostics);
          }
          break;
        }

        case 'Comment': {
          this.addCommentNode(document, token, diagnostics);
          break;
        }

        case 'CDATA': {
          this.addCDATANode(document, token, diagnostics);
          break;
        }
      }
    }

    return document;
  }

  /**
   * Parse une déclaration XML
   */
  private parseDeclaration(token: Token, _diagnostics: DiagnosticManager): XMLDeclaration | null {
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
  private parseDoctype(token: Token, _diagnostics: DiagnosticManager): XMLDoctype | null {
    const raw = token.content || '';
    const content = raw.trim();
    let rootName: string | undefined;
    let publicId: string | undefined;
    let systemId: string | undefined;

    // Basic DOCTYPE pattern parsing
    // Example: DOCTYPE note PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://..."
    //          DOCTYPE note SYSTEM "http://..."
    //          DOCTYPE note [ ... ]
    const m = content.match(/^DOCTYPE\s+([^\s>]+)\s*(.*)$/i);
    if (m) {
      rootName = m[1];
      const rest = m[2] || '';
      const restU = rest.toUpperCase();
      if (restU.includes('PUBLIC')) {
        const qm = rest.match(/PUBLIC\s+(['"])\s*([^'"]+)\1\s+(['"])\s*([^'"]+)\3/i);
        if (qm) {
          publicId = qm[2];
          systemId = qm[4];
        }
      } else if (restU.includes('SYSTEM')) {
        const sm = rest.match(/SYSTEM\s+(['"])\s*([^'"]+)\1/i);
        if (sm) {
          systemId = sm[2];
        }
      }
    }

    // Fallback to previous behavior if no match
    if (!rootName) {
      const partsFallback = content.split(/\s+/);
      rootName = partsFallback[0];
    }

    return new XMLDoctype(rootName, publicId, systemId, token.location);
  }

  /**
   * Parse un élément XML
   */
  private parseElement(
    scanner: LuciformXMLScanner,
    startToken: Token,
    diagnostics: DiagnosticManager,
    depth: number,
    parentNS: Map<string, string>
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

    // Namespace handling: derive current frame from parent
    const currentNS = new Map(parentNS);
    const splitQName = (qname: string): { prefix: string; local: string } => {
      const i = qname.indexOf(':');
      return i === -1 ? { prefix: '', local: qname } : { prefix: qname.slice(0, i), local: qname.slice(i + 1) };
    };
    const checkNamespace = (qname: string, loc?: Location, isAttribute: boolean = false) => {
      const colonCount = (qname.match(/:/g) || []).length;
      if (colonCount > 1) {
        diagnostics.addError(
          XML_ERROR_CODES.BAD_QNAME,
          `QName invalide (trop de ':'): ${qname}`,
          loc
        );
        diagnostics.incrementRecovery(XML_ERROR_CODES.BAD_QNAME);
        return;
      }
      const { prefix } = splitQName(qname);
      if (prefix && prefix !== 'xml') {
        if (!currentNS.has(prefix)) {
          diagnostics.addError(
            XML_ERROR_CODES.UNDEFINED_PREFIX,
            `Préfixe non défini: ${prefix}`,
            loc
          );
          diagnostics.incrementRecovery(XML_ERROR_CODES.UNDEFINED_PREFIX);
        }
      } else if (!prefix && isAttribute) {
        // default namespace does not apply to attributes
      }
    };

    // First pass: process xmlns declarations; store on element.namespaces and currentNS
    if (startToken.attributes) {
      for (const [name, value] of startToken.attributes) {
        if (name === 'xmlns') {
          currentNS.set('', value);
          element.setNamespace('', value);
        } else if (name.startsWith('xmlns:')) {
          const prefix = name.slice(6);
          if (prefix === 'xmlns') {
            diagnostics.addError(
              XML_ERROR_CODES.INVALID_NAMESPACE,
              'Le préfixe "xmlns" est réservé',
              startToken.location
            );
            diagnostics.incrementRecovery(XML_ERROR_CODES.INVALID_NAMESPACE);
          } else if (prefix === 'xml' && value !== 'http://www.w3.org/XML/1998/namespace') {
            diagnostics.addError(
              XML_ERROR_CODES.INVALID_NAMESPACE,
              'Le préfixe "xml" doit être lié à http://www.w3.org/XML/1998/namespace',
              startToken.location
            );
            diagnostics.incrementRecovery(XML_ERROR_CODES.INVALID_NAMESPACE);
          } else {
            currentNS.set(prefix, value);
            element.setNamespace(prefix, value);
          }
        }
      }
    }

    // Validate element qname
    if (element.name) {
      if (/^xmlns(?::|$)/.test(element.name)) {
        diagnostics.addError(
          XML_ERROR_CODES.XMLNS_PREFIX_RESERVED,
          'Le préfixe ou nom "xmlns" est réservé',
          startToken.location
        );
        diagnostics.incrementRecovery(XML_ERROR_CODES.XMLNS_PREFIX_RESERVED);
      }
      checkNamespace(element.name, startToken.location, false);
    }

    // Second pass: enforce limits, handle duplicates/invalids, and set non-xmlns attributes
    if (startToken.attributes) {
      if (startToken.duplicateAttributes && startToken.duplicateAttributes.length > 0) {
        for (const dup of startToken.duplicateAttributes) {
          diagnostics.addWarning(
            XML_ERROR_CODES.DUPLICATE_ATTRIBUTE,
            `Attribut dupliqué: ${dup}`,
            startToken.location
          );
          diagnostics.incrementRecovery(XML_ERROR_CODES.DUPLICATE_ATTRIBUTE);
        }
      }
      if (startToken.invalidAttributes && startToken.invalidAttributes.length > 0) {
        for (const inval of startToken.invalidAttributes) {
          if (inval.endsWith('/*missing-space*/')) {
            const name = inval.replace(/\/\*missing-space\*\/$/, '');
            diagnostics.addWarning(
              XML_ERROR_CODES.ATTR_MISSING_SPACE,
              `Espace requis après la valeur de "${name}"`,
              startToken.location
            );
            diagnostics.incrementRecovery(XML_ERROR_CODES.ATTR_MISSING_SPACE);
          } else {
            diagnostics.addWarning(
              XML_ERROR_CODES.ATTR_NO_VALUE,
              `Attribut sans valeur ou non quotée: ${inval}`,
              startToken.location
            );
            diagnostics.incrementRecovery(XML_ERROR_CODES.ATTR_NO_VALUE);
          }
        }
      }
      let count = 0;
      for (const [name, value] of startToken.attributes) {
        if (name === 'xmlns' || name.startsWith('xmlns:')) continue;
        if (count >= this.maxAttrCount) {
          diagnostics.addError(
            XML_ERROR_CODES.INVALID_ATTRIBUTE,
            `Nombre d'attributs dépassé: > ${this.maxAttrCount}`,
            startToken.location
          );
          diagnostics.incrementRecovery(XML_ERROR_CODES.INVALID_ATTRIBUTE);
          continue;
        }
        if (value.length > this.maxAttrValueLength) {
          diagnostics.addError(
            XML_ERROR_CODES.INVALID_ATTRIBUTE,
            `Valeur d'attribut trop longue (${value.length} > ${this.maxAttrValueLength}) pour ${name}`,
            startToken.location
          );
          diagnostics.incrementRecovery(XML_ERROR_CODES.INVALID_ATTRIBUTE);
          continue;
        }
        checkNamespace(name, startToken.location, true);
        element.setAttribute(name, value);
        count++;
      }
    }

    // Si auto-fermant, on a fini
    if (startToken.selfClosing) {
      return element;
    }

    // Arrêt immédiat si la limite de récupération est dépassée après le traitement des attributs
    if (this.maybeStopOnRecoveryCap(diagnostics, startToken.location)) {
      return element;
    }

    // Parser les enfants
    let token: Token | null;
    while ((token = scanner.next()) !== null) {
      if (this.maybeStopOnRecoveryCap(diagnostics, token.location)) {
        return element;
      }
      switch (token.type) {
        case 'StartTag': {
          const childElement = this.parseElement(scanner, token, diagnostics, depth + 1, currentNS);
          if (childElement) {
            element.addChild(childElement);
          }
          break;
        }

        case 'EndTag': {
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
            diagnostics.incrementRecovery(XML_ERROR_CODES.MISMATCHED_TAG);
          }
          break;
        }

        case 'Text': {
          if (token.content?.trim()) {
            const textNode = new XMLNode('text', token.content, token.location);
            element.addChild(textNode);
          }
          break;
        }

        case 'Comment': {
          this.addCommentNode(element, token, diagnostics);
          break;
        }

        case 'CDATA': {
          this.addCDATANode(element, token, diagnostics);
          break;
        }
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
      diagnostics.incrementRecovery(XML_ERROR_CODES.UNCLOSED_TAG);
    }

    return element;
  }

  /**
   * Ajoute un nœud de texte
   */
  private addTextNode(
    parent: XMLDocument | XMLElement,
    token: Token,
    diagnostics: DiagnosticManager
  ): void {
    const content = token.content || '';

    if (content.length > this.maxTextLength) {
      diagnostics.addError(
        XML_ERROR_CODES.MAX_TEXT_LENGTH_EXCEEDED,
        `Longueur de texte maximale dépassée: ${content.length}`,
        token.location
      );
      return;
    }

    // Coalesce with previous text node if enabled
    if (this.coalesceTextNodes && parent.children && parent.children.length > 0) {
      const last = parent.children[parent.children.length - 1];
      if (last && last.type === 'text') {
        last.content = (last.content || '') + content;
        return;
      }
    }

    const textNode = new XMLNode('text', content, token.location);
    parent.addChild(textNode);
  }

  /**
   * Ajoute un nœud de commentaire
   */
  private addCommentNode(
    parent: XMLDocument | XMLElement,
    token: Token,
    diagnostics: DiagnosticManager
  ): void {
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
      diagnostics.incrementRecovery(XML_ERROR_CODES.INVALID_COMMENT);
    }

    const commentNode = new XMLNode('comment', content, token.location);
    parent.addChild(commentNode);
  }

  /**
   * Ajoute un nœud CDATA
   */
  private addCDATANode(
    parent: XMLDocument | XMLElement,
    token: Token,
    diagnostics: DiagnosticManager
  ): void {
    const content = token.content || '';

    if (!token.closed) {
      diagnostics.addError(
        XML_ERROR_CODES.INVALID_CDATA,
        'Section CDATA non fermée correctement',
        token.location,
        'Utilisez ]]> pour fermer la section CDATA'
      );
      diagnostics.incrementRecovery(XML_ERROR_CODES.INVALID_CDATA);
    }

    const cdataNode = new XMLNode('cdata', content, token.location);
    parent.addChild(cdataNode);
  }

  /**
   * Ajoute une instruction de traitement
   */
  private addProcessingInstruction(
    parent: XMLDocument,
    token: Token,
    diagnostics: DiagnosticManager
  ): void {
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
        "Utilisez ?> pour fermer l'instruction"
      );
      diagnostics.incrementRecovery(XML_ERROR_CODES.INVALID_PI);
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

// Réexporter les classes/utilitaires principaux (éviter les conflits de noms avec ./types)
export * from './scanner';
export * from './document';
export * from './diagnostics';
