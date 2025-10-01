/**
 * Diagnostics - XML errors and warnings management
 *
 * Diagnostic system for the XML parser with error codes
 * and remediation suggestions
 */
export class DiagnosticManager {
    constructor() {
        this.diagnostics = [];
        this.errors = [];
        this.recoveryCount = 0;
        this.recoveryCapped = false;
        this.recoveryCodes = new Set();
        this.recoveryNotes = [];
    }
    /**
     * Add a diagnostic
     */
    addDiagnostic(diagnostic) {
        this.diagnostics.push(diagnostic);
        if (diagnostic.level === 'error') {
            this.errors.push(diagnostic);
        }
    }
    /**
     * Add an error
     */
    addError(code, message, location, suggestion) {
        this.addDiagnostic({
            level: 'error',
            code,
            message,
            location,
            suggestion,
        });
    }
    /**
     * Add a warning
     */
    addWarning(code, message, location, suggestion) {
        this.addDiagnostic({
            level: 'warn',
            code,
            message,
            location,
            suggestion,
        });
    }
    /**
     * Add an info
     */
    addInfo(code, message, location, suggestion) {
        this.addDiagnostic({
            level: 'info',
            code,
            message,
            location,
            suggestion,
        });
    }
    /**
     * Increment recovery counter
     */
    incrementRecovery(code) {
        this.recoveryCount++;
        if (code)
            this.recoveryCodes.add(code);
        if (this.recoveryCap !== undefined && this.recoveryCount > this.recoveryCap) {
            this.recoveryCapped = true;
        }
    }
    /**
     * Get all diagnostics
     */
    getDiagnostics() {
        return [...this.diagnostics];
    }
    /**
     * Get errors
     */
    getErrors() {
        return [...this.errors];
    }
    /**
     * Get warnings
     */
    getWarnings() {
        return this.diagnostics.filter((d) => d.level === 'warn');
    }
    /**
     * Get infos
     */
    getInfos() {
        return this.diagnostics.filter((d) => d.level === 'info');
    }
    /**
     * Get recovery count
     */
    getRecoveryCount() {
        return this.recoveryCount;
    }
    setRecoveryCap(cap) {
        this.recoveryCap = cap;
    }
    getRecoveryReport() {
        const codes = this.recoveryCodes.size ? Array.from(this.recoveryCodes) : undefined;
        const notes = this.recoveryNotes.length ? [...this.recoveryNotes] : undefined;
        return { attempts: this.recoveryCount, capped: this.recoveryCapped, codes, notes };
    }
    /**
     * Whether recovery limit has been exceeded
     */
    isRecoveryCapped() {
        return this.recoveryCapped;
    }
    /**
     * Check if there are errors
     */
    hasErrors() {
        return this.errors.length > 0;
    }
    /**
     * Check if there are warnings
     */
    hasWarnings() {
        return this.getWarnings().length > 0;
    }
    /**
     * Reset diagnostics
     */
    reset() {
        this.diagnostics = [];
        this.errors = [];
        this.recoveryCount = 0;
        this.recoveryCodes.clear();
        this.recoveryNotes = [];
    }
    /**
     * Get diagnostics summary
     */
    getSummary() {
        return {
            total: this.diagnostics.length,
            errors: this.errors.length,
            warnings: this.getWarnings().length,
            infos: this.getInfos().length,
            recoveries: this.recoveryCount,
        };
    }
    /**
     * Add a recovery note (for the report)
     */
    addRecoveryNote(note) {
        this.recoveryNotes.push(note);
    }
}
/**
 * Codes d'erreur XML standardisés
 */
export const XML_ERROR_CODES = {
    // Syntax errors
    INVALID_CHARACTER: 'INVALID_CHARACTER',
    MALFORMED_TAG: 'MALFORMED_TAG',
    UNCLOSED_TAG: 'UNCLOSED_TAG',
    MISMATCHED_TAG: 'MISMATCHED_TAG',
    DUPLICATE_ATTRIBUTE: 'DUPLICATE_ATTRIBUTE',
    INVALID_ATTRIBUTE: 'INVALID_ATTRIBUTE',
    // Structural errors
    MISSING_ROOT: 'MISSING_ROOT',
    MULTIPLE_ROOTS: 'MULTIPLE_ROOTS',
    INVALID_NESTING: 'INVALID_NESTING',
    // Content errors
    INVALID_CDATA: 'INVALID_CDATA',
    INVALID_COMMENT: 'INVALID_COMMENT',
    INVALID_PI: 'INVALID_PI',
    INVALID_DOCTYPE: 'INVALID_DOCTYPE',
    // Namespace errors
    INVALID_NAMESPACE: 'INVALID_NAMESPACE',
    UNDEFINED_PREFIX: 'UNDEFINED_PREFIX',
    XMLNS_PREFIX_RESERVED: 'XMLNS_PREFIX_RESERVED',
    XML_PREFIX_URI: 'XML_PREFIX_URI',
    BAD_QNAME: 'BAD_QNAME',
    ATTR_MISSING_SPACE: 'ATTR_MISSING_SPACE',
    ATTR_NO_VALUE: 'ATTR_NO_VALUE',
    // Security errors
    ENTITY_EXPANSION_LIMIT: 'ENTITY_EXPANSION_LIMIT',
    MAX_DEPTH_EXCEEDED: 'MAX_DEPTH_EXCEEDED',
    MAX_TEXT_LENGTH_EXCEEDED: 'MAX_TEXT_LENGTH_EXCEEDED',
    // Recovery
    RECOVERY_ATTEMPTED: 'RECOVERY_ATTEMPTED',
    PARTIAL_PARSE: 'PARTIAL_PARSE',
};
/**
 * Messages d'erreur par défaut
 */
export const XML_ERROR_MESSAGES = {
    [XML_ERROR_CODES.INVALID_CHARACTER]: 'Invalid character in XML',
    [XML_ERROR_CODES.MALFORMED_TAG]: 'Malformed tag',
    [XML_ERROR_CODES.UNCLOSED_TAG]: 'Unclosed tag',
    [XML_ERROR_CODES.MISMATCHED_TAG]: 'Mismatched tags',
    [XML_ERROR_CODES.DUPLICATE_ATTRIBUTE]: 'Duplicate attribute',
    [XML_ERROR_CODES.INVALID_ATTRIBUTE]: 'Invalid attribute',
    [XML_ERROR_CODES.MISSING_ROOT]: 'Missing root element',
    [XML_ERROR_CODES.MULTIPLE_ROOTS]: 'Multiple root elements',
    [XML_ERROR_CODES.INVALID_NESTING]: 'Invalid nesting',
    [XML_ERROR_CODES.INVALID_CDATA]: 'Invalid CDATA section',
    [XML_ERROR_CODES.INVALID_COMMENT]: 'Invalid comment',
    [XML_ERROR_CODES.INVALID_PI]: 'Invalid processing instruction',
    [XML_ERROR_CODES.INVALID_DOCTYPE]: 'Invalid DOCTYPE declaration',
    [XML_ERROR_CODES.INVALID_NAMESPACE]: 'Invalid namespace',
    [XML_ERROR_CODES.UNDEFINED_PREFIX]: 'Undefined prefix',
    [XML_ERROR_CODES.XMLNS_PREFIX_RESERVED]: 'The "xmlns" prefix is reserved',
    [XML_ERROR_CODES.XML_PREFIX_URI]: 'The "xml" prefix must bind to the standard URI',
    [XML_ERROR_CODES.BAD_QNAME]: 'Invalid qualified name (QName)',
    [XML_ERROR_CODES.ATTR_MISSING_SPACE]: 'Space required after attribute value',
    [XML_ERROR_CODES.ATTR_NO_VALUE]: 'Attribute without value or unquoted value',
    [XML_ERROR_CODES.ENTITY_EXPANSION_LIMIT]: 'Entity expansion limit exceeded',
    [XML_ERROR_CODES.MAX_DEPTH_EXCEEDED]: 'Maximum depth exceeded',
    [XML_ERROR_CODES.MAX_TEXT_LENGTH_EXCEEDED]: 'Maximum text length exceeded',
    [XML_ERROR_CODES.RECOVERY_ATTEMPTED]: 'Recovery attempted',
    [XML_ERROR_CODES.PARTIAL_PARSE]: 'Partial parse performed',
};
/**
 * Suggestions de correction par défaut
 */
export const XML_ERROR_SUGGESTIONS = {
    [XML_ERROR_CODES.INVALID_CHARACTER]: 'Check file encoding',
    [XML_ERROR_CODES.MALFORMED_TAG]: 'Verify tag syntax',
    [XML_ERROR_CODES.UNCLOSED_TAG]: 'Add the corresponding closing tag',
    [XML_ERROR_CODES.MISMATCHED_TAG]: 'Verify tag pairing',
    [XML_ERROR_CODES.DUPLICATE_ATTRIBUTE]: 'Remove the duplicate attribute',
    [XML_ERROR_CODES.INVALID_ATTRIBUTE]: 'Verify attribute syntax',
    [XML_ERROR_CODES.MISSING_ROOT]: 'Add a root element',
    [XML_ERROR_CODES.MULTIPLE_ROOTS]: 'Remove extra root elements',
    [XML_ERROR_CODES.INVALID_NESTING]: 'Verify element nesting',
    [XML_ERROR_CODES.INVALID_CDATA]: 'Verify CDATA syntax',
    [XML_ERROR_CODES.INVALID_COMMENT]: 'Verify comment syntax',
    [XML_ERROR_CODES.INVALID_PI]: 'Verify processing instruction syntax',
    [XML_ERROR_CODES.INVALID_DOCTYPE]: 'Verify DOCTYPE syntax',
    [XML_ERROR_CODES.INVALID_NAMESPACE]: 'Verify namespace declaration',
    [XML_ERROR_CODES.UNDEFINED_PREFIX]: 'Define the prefix or declare it with xmlns',
    [XML_ERROR_CODES.XMLNS_PREFIX_RESERVED]: 'Do not use "xmlns" as an application prefix',
    [XML_ERROR_CODES.XML_PREFIX_URI]: 'Use http://www.w3.org/XML/1998/namespace for "xml"',
    [XML_ERROR_CODES.BAD_QNAME]: 'Limit QName to a single ":" and a valid name',
    [XML_ERROR_CODES.ATTR_MISSING_SPACE]: 'Add a space before the next attribute',
    [XML_ERROR_CODES.ATTR_NO_VALUE]: 'Quote the attribute value with " or \'',
    [XML_ERROR_CODES.ENTITY_EXPANSION_LIMIT]: 'Reduce entity complexity',
    [XML_ERROR_CODES.MAX_DEPTH_EXCEEDED]: 'Reduce nesting depth',
    [XML_ERROR_CODES.MAX_TEXT_LENGTH_EXCEEDED]: 'Reduce text length',
    [XML_ERROR_CODES.RECOVERY_ATTEMPTED]: 'The parser attempted automatic recovery',
    [XML_ERROR_CODES.PARTIAL_PARSE]: 'Parsing was performed partially',
};
