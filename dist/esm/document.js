/**
 * XMLDocument et XMLElement - Modèles de données XML
 *
 * Classes pour représenter la structure XML parsée
 */
export class XMLNode {
    constructor(type, content, location) {
        this.type = type;
        this.content = content;
        this.location = location;
        this.children = [];
    }
    /**
     * Ajoute un enfant au nœud
     */
    addChild(child) {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
        child.parent = this;
    }
    /**
     * Trouve un enfant par nom (pour les éléments)
     */
    findChild(name) {
        if (!this.children)
            return undefined;
        return this.children.find((child) => child.type === 'element' && child.name === name);
    }
    /**
     * Trouve tous les enfants par nom (pour les éléments)
     */
    findAllChildren(name) {
        if (!this.children)
            return [];
        return this.children.filter((child) => child.type === 'element' && child.name === name);
    }
    /**
     * Obtient le texte de tous les enfants de type text
     */
    getTextContent() {
        if (!this.children)
            return '';
        return this.children
            .filter((child) => child.type === 'text')
            .map((child) => child.content || '')
            .join('');
    }
}
export class XMLElement extends XMLNode {
    constructor(name, location) {
        super('element', undefined, location);
        this.type = 'element';
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
    setAttribute(name, value) {
        this.attributes.set(name, value);
    }
    /**
     * Obtient un attribut
     */
    getAttribute(name) {
        return this.attributes.get(name);
    }
    /**
     * Vérifie si un attribut existe
     */
    hasAttribute(name) {
        return this.attributes.has(name);
    }
    /**
     * Supprime un attribut
     */
    removeAttribute(name) {
        return this.attributes.delete(name);
    }
    /**
     * Ajoute un namespace
     */
    setNamespace(prefix, uri) {
        this.namespaces.set(prefix, uri);
    }
    /**
     * Obtient un namespace
     */
    getNamespace(prefix) {
        return this.namespaces.get(prefix);
    }
    /**
     * Trouve un élément par nom (récursif)
     */
    findElement(name) {
        if (this.name === name) {
            return this;
        }
        for (const child of this.children) {
            if (child.type === 'element') {
                const found = child.findElement(name);
                if (found)
                    return found;
            }
        }
        return undefined;
    }
    /**
     * Trouve tous les éléments par nom (récursif)
     */
    findAllElements(name) {
        const results = [];
        if (this.name === name) {
            results.push(this);
        }
        for (const child of this.children) {
            if (child.type === 'element') {
                results.push(...child.findAllElements(name));
            }
        }
        return results;
    }
    /**
     * Obtient le chemin complet de l'élément
     */
    getPath() {
        const path = [];
        let current = this;
        while (current && current.type === 'element') {
            path.unshift(current.name);
            current = current.parent;
        }
        return path.join('/');
    }
}
export class XMLDocument {
    constructor() {
        this.children = [];
        this.namespaces = new Map();
    }
    /**
     * Ajoute un enfant au document
     */
    addChild(child) {
        this.children.push(child);
        if (child.type === 'element' && !this.root) {
            this.root = child;
        }
    }
    /**
     * Trouve un élément par nom (récursif depuis la racine)
     */
    findElement(name) {
        if (this.root) {
            return this.root.findElement(name);
        }
        return undefined;
    }
    /**
     * Trouve tous les éléments par nom (récursif depuis la racine)
     */
    findAllElements(name) {
        if (this.root) {
            return this.root.findAllElements(name);
        }
        return [];
    }
    /**
     * Obtient tous les éléments (récursif)
     */
    getAllElements() {
        const elements = [];
        const collectElements = (node) => {
            if (node.type === 'element') {
                elements.push(node);
                for (const child of node.children) {
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
    constructor(version, encoding, standalone, location) {
        this.version = version;
        this.encoding = encoding;
        this.standalone = standalone;
        this.location = location;
    }
}
export class XMLDoctype {
    constructor(name, publicId, systemId, location) {
        this.name = name;
        this.publicId = publicId;
        this.systemId = systemId;
        this.location = location;
    }
}
