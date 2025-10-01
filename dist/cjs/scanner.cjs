"use strict";
/**
 * LuciformXMLScanner - Scanner XML robuste
 *
 * Tokenizer à états pour parser XML avec gestion des erreurs
 * et mode permissif pour récupération d'erreurs
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuciformXMLScanner = void 0;
class LuciformXMLScanner {
    constructor(content) {
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.state = 'Text';
        // Gérer le BOM au début
        if (content.startsWith('\uFEFF')) {
            this.content = content.slice(1);
        }
        else {
            this.content = content;
        }
    }
    /**
     * Token suivant avec gestion d'états
     */
    next() {
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
    scanText() {
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
                }
                else if (nextChars.startsWith('<?xml') || nextChars.startsWith('<?')) {
                    this.state = 'PI';
                    break;
                }
                else if (nextChars.startsWith('<![CDATA[')) {
                    this.state = 'CDATA';
                    break;
                }
                else if (nextChars.startsWith('<!DOCTYPE')) {
                    this.state = 'Doctype';
                    break;
                }
                else if (char === '<' && this.content[this.position + 1] === '/') {
                    this.state = 'EndTag';
                    break;
                }
                else {
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
            location: startLocation
        };
    }
    scanTag() {
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
                invalidAttributes: ['empty-tag-name']
            };
        }
        // Lire les attributs
        const attributes = this.readAttributes();
        // Vérifier si c'est auto-fermant
        const selfClosing = this.content[this.position] === '/' && this.content[this.position + 1] === '>';
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
            selfClosing
        };
    }
    scanEndTag() {
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
            tagName: tagName || ''
        };
    }
    scanComment() {
        const startLocation = this.getCurrentLocation();
        this.advance(); // Skip '<'
        this.advance(); // Skip '!'
        this.advance(); // Skip '-'
        this.advance(); // Skip '-'
        const start = this.position;
        let closed = false;
        while (this.position < this.content.length - 2) {
            if (this.content[this.position] === '-' &&
                this.content[this.position + 1] === '-' &&
                this.content[this.position + 2] === '>') {
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
            closed
        };
    }
    scanProcessingInstruction() {
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
            closed
        };
    }
    scanCDATA() {
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
            if (this.content[this.position] === ']' &&
                this.content[this.position + 1] === ']' &&
                this.content[this.position + 2] === '>') {
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
            closed
        };
    }
    scanDoctype() {
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
            closed
        };
    }
    readTagName() {
        const start = this.position;
        while (this.position < this.content.length) {
            const char = this.content[this.position];
            if (char === ' ' || char === '\t' || char === '\n' || char === '\r' ||
                char === '/' || char === '>') {
                break;
            }
            this.advance();
        }
        return this.content.substring(start, this.position);
    }
    readAttributes() {
        const attributes = new Map();
        // Skip whitespace
        while (this.position < this.content.length &&
            /\s/.test(this.content[this.position])) {
            this.advance();
        }
        while (this.position < this.content.length &&
            this.content[this.position] !== '>' &&
            this.content[this.position] !== '/') {
            const attrName = this.readAttributeName();
            if (!attrName)
                break;
            // Skip whitespace and '='
            while (this.position < this.content.length &&
                (/\s/.test(this.content[this.position]) || this.content[this.position] === '=')) {
                this.advance();
            }
            const attrValue = this.readAttributeValue();
            if (attrValue !== null) {
                attributes.set(attrName, attrValue);
            }
            // Skip whitespace
            while (this.position < this.content.length &&
                /\s/.test(this.content[this.position])) {
                this.advance();
            }
        }
        return attributes;
    }
    readAttributeName() {
        const start = this.position;
        while (this.position < this.content.length) {
            const char = this.content[this.position];
            if (char === ' ' || char === '\t' || char === '\n' || char === '\r' ||
                char === '=' || char === '>' || char === '/') {
                break;
            }
            this.advance();
        }
        return this.content.substring(start, this.position);
    }
    readAttributeValue() {
        if (this.position >= this.content.length)
            return null;
        const char = this.content[this.position];
        if (char !== '"' && char !== "'")
            return null;
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
    advance() {
        if (this.position < this.content.length) {
            if (this.content[this.position] === '\n') {
                this.line++;
                this.column = 1;
            }
            else {
                this.column++;
            }
            this.position++;
        }
    }
    getCurrentLocation() {
        return {
            line: this.line,
            column: this.column,
            position: this.position
        };
    }
    /**
     * Réinitialise le scanner
     */
    reset() {
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.state = 'Text';
    }
    /**
     * Obtient la position actuelle
     */
    getPosition() {
        return this.position;
    }
    /**
     * Obtient l'état actuel
     */
    getState() {
        return this.state;
    }
}
exports.LuciformXMLScanner = LuciformXMLScanner;
