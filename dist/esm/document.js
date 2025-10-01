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
     * Namespace resolution helpers (effective mapping inherited from parents)
     */
    getEffectiveNamespaces() {
        const map = new Map([['xml', 'http://www.w3.org/XML/1998/namespace']]);
        const stack = [];
        let cur = this;
        while (cur) {
            if (cur.type === 'element')
                stack.unshift(cur);
            cur = cur.parent;
        }
        for (const el of stack) {
            for (const [p, uri] of el.namespaces)
                map.set(p, uri);
        }
        return map;
    }
    splitQName(qname) {
        const i = qname.indexOf(':');
        return i === -1 ? { prefix: '', local: qname } : { prefix: qname.slice(0, i), local: qname.slice(i + 1) };
    }
    getResolvedName() {
        const { prefix, local } = this.splitQName(this.name);
        if (!prefix) {
            const ns = this.getEffectiveNamespaces().get('');
            return ns ? { namespace: ns, local } : { local };
        }
        const ns = this.getEffectiveNamespaces().get(prefix);
        return ns ? { namespace: ns, local } : { local };
    }
    findByNS(namespace, localName) {
        const self = this.getResolvedName();
        if (self.local === localName && (self.namespace ?? undefined) === (namespace ?? undefined)) {
            return this;
        }
        for (const child of this.children) {
            if (child.type === 'element') {
                const hit = child.findByNS(namespace, localName);
                if (hit)
                    return hit;
            }
        }
        return undefined;
    }
    findAllByNS(namespace, localName) {
        const out = [];
        const self = this.getResolvedName();
        if (self.local === localName && (self.namespace ?? undefined) === (namespace ?? undefined)) {
            out.push(this);
        }
        for (const child of this.children) {
            if (child.type === 'element') {
                out.push(...child.findAllByNS(namespace, localName));
            }
        }
        return out;
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
    findByNS(namespace, localName) {
        if (this.root)
            return this.root.findByNS(namespace, localName);
        return undefined;
    }
    findAllByNS(namespace, localName) {
        if (this.root)
            return this.root.findAllByNS(namespace, localName);
        return [];
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
