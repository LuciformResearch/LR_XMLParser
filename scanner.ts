/**
 * LuciformXMLScanner - Scanner XML robuste
 *
 * Tokenizer à états pour parser XML avec gestion des erreurs
 * et mode permissif pour récupération d'erreurs
 */

import { Token, Location, ScannerState } from './types';

export class LuciformXMLScanner {
  private content: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private state: ScannerState = 'Text';

  constructor(content: string) {
    // Gérer le BOM au début
    if (content.startsWith('\uFEFF')) {
      this.content = content.slice(1);
    } else {
      this.content = content;
    }
  }

  /**
   * Token suivant avec gestion d'états
   */
  next(): Token | null {
    if (this.position >= this.content.length) {
      return null;
    }

    switch (this.state) {
      case 'Text':
        return this.scanText();
      case 'StartTag':
        return this.scanTag();
      case 'EndTag':
        return this.scanEndTag();
      case 'Comment':
        return this.scanComment();
      case 'PI':
        return this.scanProcessingInstruction();
      case 'CDATA':
        return this.scanCDATA();
      case 'Doctype':
        return this.scanDoctype();
      default:
        return this.scanText();
    }
  }

  private scanText(): Token {
    const startLocation = this.getCurrentLocation();
    const start = this.position;

    while (this.position < this.content.length) {
      const char = this.content[this.position];

      if (char === '<') {
        // Vérifier si c'est le début d'une section spéciale
        const nextChars = this.content.substring(this.position, this.position + 9);

        if (nextChars.startsWith('<!--')) {
          this.state = 'Comment';
          break;
        } else if (nextChars.startsWith('<?xml') || nextChars.startsWith('<?')) {
          this.state = 'PI';
          break;
        } else if (nextChars.startsWith('<![CDATA[')) {
          this.state = 'CDATA';
          break;
        } else if (nextChars.startsWith('<!DOCTYPE')) {
          this.state = 'Doctype';
          break;
        } else if (char === '<' && this.content[this.position + 1] === '/') {
          this.state = 'EndTag';
          break;
        } else {
          this.state = 'StartTag';
          break;
        }
      }

      this.advance();
    }

    const content = this.content.substring(start, this.position);
    return {
      type: 'Text',
      content,
      location: startLocation,
    };
  }

  private scanTag(): Token {
    const startLocation = this.getCurrentLocation();
    this.advance(); // Skip '<'

    // Lire le nom de la balise
    const tagName = this.readTagName();
    if (!tagName) {
      return {
        type: 'StartTag',
        content: '<',
        location: startLocation,
        tagName: '',
        attributes: new Map(),
        invalidAttributes: ['empty-tag-name'],
      };
    }

    // Lire les attributs
    const { attributes, duplicateAttributes, invalidAttributes } = this.readAttributes();

    // Vérifier si c'est auto-fermant
    const selfClosing =
      this.content[this.position] === '/' && this.content[this.position + 1] === '>';
    if (selfClosing) {
      this.advance(); // Skip '/'
    }

    // Skip '>'
    if (this.content[this.position] === '>') {
      this.advance();
    }

    this.state = 'Text';

    return {
      type: 'StartTag',
      content: this.content.substring(startLocation.position, this.position),
      location: startLocation,
      tagName,
      attributes,
      invalidAttributes,
      duplicateAttributes,
      selfClosing,
    };
  }

  private scanEndTag(): Token {
    const startLocation = this.getCurrentLocation();
    this.advance(); // Skip '<'
    this.advance(); // Skip '/'

    const tagName = this.readTagName();

    // Skip '>'
    while (this.position < this.content.length && this.content[this.position] !== '>') {
      this.advance();
    }
    if (this.content[this.position] === '>') {
      this.advance();
    }

    this.state = 'Text';

    return {
      type: 'EndTag',
      content: this.content.substring(startLocation.position, this.position),
      location: startLocation,
      tagName: tagName || '',
    };
  }

  private scanComment(): Token {
    const startLocation = this.getCurrentLocation();
    this.advance(); // Skip '<'
    this.advance(); // Skip '!'
    this.advance(); // Skip '-'
    this.advance(); // Skip '-'

    const start = this.position;
    let closed = false;

    while (this.position < this.content.length - 2) {
      if (
        this.content[this.position] === '-' &&
        this.content[this.position + 1] === '-' &&
        this.content[this.position + 2] === '>'
      ) {
        closed = true;
        this.advance(); // Skip '-'
        this.advance(); // Skip '-'
        this.advance(); // Skip '>'
        break;
      }
      this.advance();
    }

    this.state = 'Text';

    return {
      type: 'Comment',
      content: this.content.substring(start, this.position - (closed ? 3 : 0)),
      location: startLocation,
      closed,
    };
  }

  private scanProcessingInstruction(): Token {
    const startLocation = this.getCurrentLocation();
    this.advance(); // Skip '<'
    this.advance(); // Skip '?'

    const start = this.position;
    let closed = false;

    while (this.position < this.content.length - 1) {
      if (this.content[this.position] === '?' && this.content[this.position + 1] === '>') {
        closed = true;
        this.advance(); // Skip '?'
        this.advance(); // Skip '>'
        break;
      }
      this.advance();
    }

    this.state = 'Text';

    return {
      type: 'PI',
      content: this.content.substring(start, this.position - (closed ? 2 : 0)),
      location: startLocation,
      closed,
    };
  }

  private scanCDATA(): Token {
    const startLocation = this.getCurrentLocation();
    this.advance(); // Skip '<'
    this.advance(); // Skip '!'
    this.advance(); // Skip '['
    this.advance(); // Skip 'C'
    this.advance(); // Skip 'D'
    this.advance(); // Skip 'A'
    this.advance(); // Skip 'T'
    this.advance(); // Skip 'A'
    this.advance(); // Skip '['

    const start = this.position;
    let closed = false;

    while (this.position < this.content.length - 2) {
      if (
        this.content[this.position] === ']' &&
        this.content[this.position + 1] === ']' &&
        this.content[this.position + 2] === '>'
      ) {
        closed = true;
        this.advance(); // Skip ']'
        this.advance(); // Skip ']'
        this.advance(); // Skip '>'
        break;
      }
      this.advance();
    }

    this.state = 'Text';

    return {
      type: 'CDATA',
      content: this.content.substring(start, this.position - (closed ? 3 : 0)),
      location: startLocation,
      closed,
    };
  }

  private scanDoctype(): Token {
    const startLocation = this.getCurrentLocation();
    this.advance(); // Skip '<'
    this.advance(); // Skip '!'

    const start = this.position;
    let closed = false;

    while (this.position < this.content.length) {
      if (this.content[this.position] === '>') {
        closed = true;
        this.advance(); // Skip '>'
        break;
      }
      this.advance();
    }

    this.state = 'Text';

    return {
      type: 'Doctype',
      content: this.content.substring(start, this.position - (closed ? 1 : 0)),
      location: startLocation,
      closed,
    };
  }

  private readTagName(): string {
    const start = this.position;

    while (this.position < this.content.length) {
      const char = this.content[this.position];

      if (
        char === ' ' ||
        char === '\t' ||
        char === '\n' ||
        char === '\r' ||
        char === '/' ||
        char === '>'
      ) {
        break;
      }

      this.advance();
    }

    return this.content.substring(start, this.position);
  }

  private readAttributes(): { attributes: Map<string, string>; duplicateAttributes: string[]; invalidAttributes: string[] } {
    const attributes = new Map<string, string>();
    const duplicateAttributes: string[] = [];
    const invalidAttributes: string[] = [];

    // Skip whitespace
    while (this.position < this.content.length && /\s/.test(this.content[this.position])) {
      this.advance();
    }

    while (
      this.position < this.content.length &&
      this.content[this.position] !== '>' &&
      this.content[this.position] !== '/'
    ) {
      const attrName = this.readAttributeName();
      if (!attrName) break;

      // Skip whitespace
      while (this.position < this.content.length && /\s/.test(this.content[this.position])) {
        this.advance();
      }
      // Expect '='
      if (this.content[this.position] !== '=') {
        invalidAttributes.push(attrName); // no value assigned
        // Skip until whitespace or tag end to avoid infinite loops
        while (
          this.position < this.content.length &&
          !/\s|>|\//.test(this.content[this.position])
        ) {
          this.advance();
        }
        // continue to next attribute
        while (this.position < this.content.length && /\s/.test(this.content[this.position])) {
          this.advance();
        }
        continue;
      }
      this.advance(); // consume '='

      const attrValue = this.readAttributeValue();
      if (attrValue !== null) {
        if (attributes.has(attrName)) {
          duplicateAttributes.push(attrName);
        }
        attributes.set(attrName, attrValue);
        // After closing quote, ensure separator or tag end
        if (
          this.position < this.content.length &&
          !/\s|>|\//.test(this.content[this.position])
        ) {
          invalidAttributes.push(`${attrName}/*missing-space*/`);
        }
      } else {
        // Not a quoted value => invalid
        invalidAttributes.push(attrName);
      }

      // Skip whitespace
      while (this.position < this.content.length && /\s/.test(this.content[this.position])) {
        this.advance();
      }
    }

    return { attributes, duplicateAttributes, invalidAttributes };
  }

  private readAttributeName(): string {
    const start = this.position;

    while (this.position < this.content.length) {
      const char = this.content[this.position];

      if (
        char === ' ' ||
        char === '\t' ||
        char === '\n' ||
        char === '\r' ||
        char === '=' ||
        char === '>' ||
        char === '/'
      ) {
        break;
      }

      this.advance();
    }

    return this.content.substring(start, this.position);
  }

  private readAttributeValue(): string | null {
    if (this.position >= this.content.length) return null;

    const char = this.content[this.position];
    if (char !== '"' && char !== "'") return null;

    const quote = char;
    this.advance(); // Skip opening quote

    const start = this.position;

    while (this.position < this.content.length) {
      if (this.content[this.position] === quote) {
        this.advance(); // Skip closing quote
        break;
      }
      this.advance();
    }

    return this.content.substring(start, this.position - 1);
  }

  private advance(): void {
    if (this.position < this.content.length) {
      if (this.content[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
  }

  private getCurrentLocation(): Location {
    return {
      line: this.line,
      column: this.column,
      position: this.position,
    };
  }

  /**
   * Réinitialise le scanner
   */
  reset(): void {
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.state = 'Text';
  }

  /**
   * Obtient la position actuelle
   */
  getPosition(): number {
    return this.position;
  }

  /**
   * Obtient l'état actuel
   */
  getState(): ScannerState {
    return this.state;
  }
}
