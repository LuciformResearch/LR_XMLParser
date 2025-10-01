/**
 * Minimal SAX-like streaming interface over the scanner tokens.
 */
import { LuciformXMLScanner } from './scanner';
import type { Token } from './types';

export type SAXHandlers = {
  onStartElement?: (name: string, attrs: Map<string, string>) => void;
  onEndElement?: (name: string) => void;
  onText?: (text: string) => void;
  onComment?: (text: string, closed: boolean) => void;
  onCDATA?: (text: string, closed: boolean) => void;
  onPI?: (content: string, closed: boolean) => void;
  onDoctype?: (content: string) => void;
};

export class LuciformSAX {
  private scanner: LuciformXMLScanner;
  private handlers: SAXHandlers;

  constructor(content: string, handlers: SAXHandlers = {}) {
    this.scanner = new LuciformXMLScanner(content);
    this.handlers = handlers;
  }

  run(): void {
    let t: Token | null;
    while ((t = this.scanner.next()) !== null) {
      switch (t.type) {
        case 'StartTag':
          this.handlers.onStartElement?.(t.tagName || '', t.attributes || new Map());
          break;
        case 'EndTag':
          this.handlers.onEndElement?.(t.tagName || '');
          break;
        case 'Text':
          if (t.content) this.handlers.onText?.(t.content);
          break;
        case 'Comment':
          this.handlers.onComment?.(t.content || '', !!t.closed);
          break;
        case 'CDATA':
          this.handlers.onCDATA?.(t.content || '', !!t.closed);
          break;
        case 'PI':
          this.handlers.onPI?.(t.content || '', !!t.closed);
          break;
        case 'Doctype':
          this.handlers.onDoctype?.(t.content || '');
          break;
      }
    }
  }
}

