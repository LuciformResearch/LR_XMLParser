/**
 * XMLDocument et XMLElement - Modèles de données XML
 *
 * Classes pour représenter la structure XML parsée
 */

import { Location } from './types';

export class XMLNode {
  type: 'element' | 'text' | 'comment' | 'pi' | 'cdata' | 'doctype';
  content?: string;
  location?: Location;
  children?: XMLNode[];
  parent?: XMLNode;

  constructor(type: XMLNode['type'], content?: string, location?: Location) {
    this.type = type;
    this.content = content;
    this.location = location;
    this.children = [];
  }

  /**
   * Ajoute un enfant au nœud
   */
  addChild(child: XMLNode): void {
    if (!this.children) {
      this.children = [];
    }
    this.children.push(child);
    child.parent = this;
  }

  /**
   * Trouve un enfant par nom (pour les éléments)
   */
  findChild(name: string): XMLElement | undefined {
    if (!this.children) return undefined;

    return this.children.find(
      (child) => child.type === 'element' && (child as XMLElement).name === name
    ) as XMLElement | undefined;
  }

  /**
   * Trouve tous les enfants par nom (pour les éléments)
   */
  findAllChildren(name: string): XMLElement[] {
    if (!this.children) return [];

    return this.children.filter(
      (child) => child.type === 'element' && (child as XMLElement).name === name
    ) as XMLElement[];
  }

  /**
   * Obtient le texte de tous les enfants de type text
   */
  getTextContent(): string {
    if (!this.children) return '';

    return this.children
      .filter((child) => child.type === 'text')
      .map((child) => child.content || '')
      .join('');
  }
}

export class XMLElement extends XMLNode {
  type: 'element' = 'element';
  name: string;
  attributes: Map<string, string>;
  namespaces: Map<string, string>;
  children: XMLNode[];
  selfClosing: boolean;
  closed: boolean;

  constructor(name: string, location?: Location) {
    super('element', undefined, location);
    this.name = name;
    this.attributes = new Map();
    this.namespaces = new Map();
    this.children = [];
    this.selfClosing = false;
    this.closed = false;
  }

  /**
   * Ajoute un attribut
   */
  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  /**
   * Obtient un attribut
   */
  getAttribute(name: string): string | undefined {
    return this.attributes.get(name);
  }

  /**
   * Vérifie si un attribut existe
   */
  hasAttribute(name: string): boolean {
    return this.attributes.has(name);
  }

  /**
   * Supprime un attribut
   */
  removeAttribute(name: string): boolean {
    return this.attributes.delete(name);
  }

  /**
   * Ajoute un namespace
   */
  setNamespace(prefix: string, uri: string): void {
    this.namespaces.set(prefix, uri);
  }

  /**
   * Obtient un namespace
   */
  getNamespace(prefix: string): string | undefined {
    return this.namespaces.get(prefix);
  }

  /**
   * Trouve un élément par nom (récursif)
   */
  findElement(name: string): XMLElement | undefined {
    if (this.name === name) {
      return this;
    }

    for (const child of this.children) {
      if (child.type === 'element') {
        const found = (child as XMLElement).findElement(name);
        if (found) return found;
      }
    }

    return undefined;
  }

  /**
   * Trouve tous les éléments par nom (récursif)
   */
  findAllElements(name: string): XMLElement[] {
    const results: XMLElement[] = [];

    if (this.name === name) {
      results.push(this);
    }

    for (const child of this.children) {
      if (child.type === 'element') {
        results.push(...(child as XMLElement).findAllElements(name));
      }
    }

    return results;
  }

  /**
   * Obtient le chemin complet de l'élément
   */
  getPath(): string {
    const path: string[] = [];
    let current: XMLNode | undefined = this;

    while (current && current.type === 'element') {
      path.unshift((current as XMLElement).name);
      current = current.parent;
    }

    return path.join('/');
  }
}

export class XMLDocument {
  declaration?: XMLDeclaration;
  doctype?: XMLDoctype;
  root?: XMLElement;
  children: XMLNode[];
  namespaces: Map<string, string>;

  constructor() {
    this.children = [];
    this.namespaces = new Map();
  }

  /**
   * Ajoute un enfant au document
   */
  addChild(child: XMLNode): void {
    this.children.push(child);

    if (child.type === 'element' && !this.root) {
      this.root = child as XMLElement;
    }
  }

  /**
   * Trouve un élément par nom (récursif depuis la racine)
   */
  findElement(name: string): XMLElement | undefined {
    if (this.root) {
      return this.root.findElement(name);
    }
    return undefined;
  }

  /**
   * Trouve tous les éléments par nom (récursif depuis la racine)
   */
  findAllElements(name: string): XMLElement[] {
    if (this.root) {
      return this.root.findAllElements(name);
    }
    return [];
  }

  /**
   * Obtient tous les éléments (récursif)
   */
  getAllElements(): XMLElement[] {
    const elements: XMLElement[] = [];

    const collectElements = (node: XMLNode) => {
      if (node.type === 'element') {
        elements.push(node as XMLElement);
        for (const child of (node as XMLElement).children) {
          collectElements(child);
        }
      }
    };

    for (const child of this.children) {
      collectElements(child);
    }

    return elements;
  }
}

export class XMLDeclaration {
  version?: string;
  encoding?: string;
  standalone?: boolean;
  location?: Location;

  constructor(version?: string, encoding?: string, standalone?: boolean, location?: Location) {
    this.version = version;
    this.encoding = encoding;
    this.standalone = standalone;
    this.location = location;
  }
}

export class XMLDoctype {
  name?: string;
  publicId?: string;
  systemId?: string;
  location?: Location;

  constructor(name?: string, publicId?: string, systemId?: string, location?: Location) {
    this.name = name;
    this.publicId = publicId;
    this.systemId = systemId;
    this.location = location;
  }
}
