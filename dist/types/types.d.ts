/**
 * Types et interfaces pour le parser XML Luciform
 *
 * Définitions centralisées pour tous les modules du parser XML
 */
export interface Location {
    line: number;
    column: number;
    position: number;
}
export interface Token {
    type: 'Text' | 'StartTag' | 'EndTag' | 'Comment' | 'PI' | 'CDATA' | 'Doctype';
    content: string;
    location: Location;
    tagName?: string;
    attributes?: Map<string, string>;
    selfClosing?: boolean;
    duplicateAttributes?: string[];
    invalidAttributes?: string[];
    closed?: boolean;
}
export interface QName {
    localName: string;
    prefix?: string;
    namespace?: string;
}
export interface Attribute {
    name: QName;
    value: string;
    location: Location;
}
export interface Diagnostic {
    level: 'info' | 'warn' | 'error';
    code: string;
    message: string;
    location?: Location;
    suggestion?: string;
}
export interface ParseResult {
    success: boolean;
    document?: XMLDocument;
    errors: Diagnostic[];
    diagnostics: Diagnostic[];
    recoveryCount: number;
    nodeCount: number;
}
export type ScannerState = 'Text' | 'StartTag' | 'EndTag' | 'Comment' | 'PI' | 'CDATA' | 'Doctype';
export interface ScannerOptions {
    maxDepth?: number;
    maxTextLength?: number;
    entityExpansionLimit?: number;
    allowDTD?: boolean;
    maxAttrCount?: number;
    maxAttrValueLength?: number;
    maxCommentLength?: number;
    maxPILength?: number;
    useUnicodeNames?: boolean;
}
export interface ParserOptions extends ScannerOptions {
    mode?: 'strict' | 'permissive' | 'luciform-permissive';
}
export interface XMLNode {
    type: 'element' | 'text' | 'comment' | 'pi' | 'cdata' | 'doctype';
    content?: string;
    location?: Location;
    children?: XMLNode[];
    parent?: XMLNode;
}
export interface XMLElement extends XMLNode {
    type: 'element';
    name: string;
    attributes: Map<string, string>;
    namespaces: Map<string, string>;
    children: XMLNode[];
    selfClosing: boolean;
    closed: boolean;
}
export interface XMLDocument {
    declaration?: XMLDeclaration;
    doctype?: XMLDoctype;
    root?: XMLElement;
    children: XMLNode[];
    namespaces: Map<string, string>;
}
export interface XMLDeclaration {
    version?: string;
    encoding?: string;
    standalone?: boolean;
    location?: Location;
}
export interface XMLDoctype {
    name?: string;
    publicId?: string;
    systemId?: string;
    location?: Location;
}
