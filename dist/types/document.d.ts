/**
 * XMLDocument et XMLElement - Modèles de données XML
 *
 * Classes pour représenter la structure XML parsée
 */
import { Location } from './types';
export declare class XMLNode {
    type: 'element' | 'text' | 'comment' | 'pi' | 'cdata' | 'doctype';
    content?: string;
    location?: Location;
    children?: XMLNode[];
    parent?: XMLNode;
    constructor(type: XMLNode['type'], content?: string, location?: Location);
    /**
     * Ajoute un enfant au nœud
     */
    addChild(child: XMLNode): void;
    /**
     * Trouve un enfant par nom (pour les éléments)
     */
    findChild(name: string): XMLElement | undefined;
    /**
     * Trouve tous les enfants par nom (pour les éléments)
     */
    findAllChildren(name: string): XMLElement[];
    /**
     * Obtient le texte de tous les enfants de type text
     */
    getTextContent(): string;
}
export declare class XMLElement extends XMLNode {
    type: 'element';
    name: string;
    attributes: Map<string, string>;
    namespaces: Map<string, string>;
    children: XMLNode[];
    selfClosing: boolean;
    closed: boolean;
    constructor(name: string, location?: Location);
    /**
     * Ajoute un attribut
     */
    setAttribute(name: string, value: string): void;
    /**
     * Obtient un attribut
     */
    getAttribute(name: string): string | undefined;
    /**
     * Vérifie si un attribut existe
     */
    hasAttribute(name: string): boolean;
    /**
     * Supprime un attribut
     */
    removeAttribute(name: string): boolean;
    /**
     * Ajoute un namespace
     */
    setNamespace(prefix: string, uri: string): void;
    /**
     * Obtient un namespace
     */
    getNamespace(prefix: string): string | undefined;
    /**
     * Trouve un élément par nom (récursif)
     */
    findElement(name: string): XMLElement | undefined;
    /**
     * Trouve tous les éléments par nom (récursif)
     */
    findAllElements(name: string): XMLElement[];
    /**
     * Obtient le chemin complet de l'élément
     */
    getPath(): string;
}
export declare class XMLDocument {
    declaration?: XMLDeclaration;
    doctype?: XMLDoctype;
    root?: XMLElement;
    children: XMLNode[];
    namespaces: Map<string, string>;
    constructor();
    /**
     * Ajoute un enfant au document
     */
    addChild(child: XMLNode): void;
    /**
     * Trouve un élément par nom (récursif depuis la racine)
     */
    findElement(name: string): XMLElement | undefined;
    /**
     * Trouve tous les éléments par nom (récursif depuis la racine)
     */
    findAllElements(name: string): XMLElement[];
    /**
     * Obtient tous les éléments (récursif)
     */
    getAllElements(): XMLElement[];
}
export declare class XMLDeclaration {
    version?: string;
    encoding?: string;
    standalone?: boolean;
    location?: Location;
    constructor(version?: string, encoding?: string, standalone?: boolean, location?: Location);
}
export declare class XMLDoctype {
    name?: string;
    publicId?: string;
    systemId?: string;
    location?: Location;
    constructor(name?: string, publicId?: string, systemId?: string, location?: Location);
}
