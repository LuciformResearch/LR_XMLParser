/**
 * Diagnostics - XML errors and warnings management
 *
 * Diagnostic system for the XML parser with error codes
 * and remediation suggestions
 */
import { Diagnostic, Location } from './types';
export declare class DiagnosticManager {
    private diagnostics;
    private errors;
    private recoveryCount;
    private recoveryCap?;
    private recoveryCapped;
    private recoveryCodes;
    private recoveryNotes;
    /**
     * Add a diagnostic
     */
    addDiagnostic(diagnostic: Diagnostic): void;
    /**
     * Add an error
     */
    addError(code: string, message: string, location?: Location, suggestion?: string): void;
    /**
     * Add a warning
     */
    addWarning(code: string, message: string, location?: Location, suggestion?: string): void;
    /**
     * Add an info
     */
    addInfo(code: string, message: string, location?: Location, suggestion?: string): void;
    /**
     * Increment recovery counter
     */
    incrementRecovery(code?: string): void;
    /**
     * Get all diagnostics
     */
    getDiagnostics(): Diagnostic[];
    /**
     * Get errors
     */
    getErrors(): Diagnostic[];
    /**
     * Get warnings
     */
    getWarnings(): Diagnostic[];
    /**
     * Get infos
     */
    getInfos(): Diagnostic[];
    /**
     * Get recovery count
     */
    getRecoveryCount(): number;
    setRecoveryCap(cap?: number): void;
    getRecoveryReport(): {
        attempts: number;
        capped: boolean;
        codes?: string[];
        notes?: string[];
    };
    /**
     * Whether recovery limit has been exceeded
     */
    isRecoveryCapped(): boolean;
    /**
     * Check if there are errors
     */
    hasErrors(): boolean;
    /**
     * Check if there are warnings
     */
    hasWarnings(): boolean;
    /**
     * Reset diagnostics
     */
    reset(): void;
    /**
     * Get diagnostics summary
     */
    getSummary(): {
        total: number;
        errors: number;
        warnings: number;
        infos: number;
        recoveries: number;
    };
    /**
     * Add a recovery note (for the report)
     */
    addRecoveryNote(note: string): void;
}
/**
 * Codes d'erreur XML standardisés
 */
export declare const XML_ERROR_CODES: {
    readonly INVALID_CHARACTER: "INVALID_CHARACTER";
    readonly MALFORMED_TAG: "MALFORMED_TAG";
    readonly UNCLOSED_TAG: "UNCLOSED_TAG";
    readonly MISMATCHED_TAG: "MISMATCHED_TAG";
    readonly DUPLICATE_ATTRIBUTE: "DUPLICATE_ATTRIBUTE";
    readonly INVALID_ATTRIBUTE: "INVALID_ATTRIBUTE";
    readonly MISSING_ROOT: "MISSING_ROOT";
    readonly MULTIPLE_ROOTS: "MULTIPLE_ROOTS";
    readonly INVALID_NESTING: "INVALID_NESTING";
    readonly INVALID_CDATA: "INVALID_CDATA";
    readonly INVALID_COMMENT: "INVALID_COMMENT";
    readonly INVALID_PI: "INVALID_PI";
    readonly INVALID_DOCTYPE: "INVALID_DOCTYPE";
    readonly INVALID_NAMESPACE: "INVALID_NAMESPACE";
    readonly UNDEFINED_PREFIX: "UNDEFINED_PREFIX";
    readonly XMLNS_PREFIX_RESERVED: "XMLNS_PREFIX_RESERVED";
    readonly XML_PREFIX_URI: "XML_PREFIX_URI";
    readonly BAD_QNAME: "BAD_QNAME";
    readonly ATTR_MISSING_SPACE: "ATTR_MISSING_SPACE";
    readonly ATTR_NO_VALUE: "ATTR_NO_VALUE";
    readonly ENTITY_EXPANSION_LIMIT: "ENTITY_EXPANSION_LIMIT";
    readonly MAX_DEPTH_EXCEEDED: "MAX_DEPTH_EXCEEDED";
    readonly MAX_TEXT_LENGTH_EXCEEDED: "MAX_TEXT_LENGTH_EXCEEDED";
    readonly RECOVERY_ATTEMPTED: "RECOVERY_ATTEMPTED";
    readonly PARTIAL_PARSE: "PARTIAL_PARSE";
};
/**
 * Messages d'erreur par défaut
 */
export declare const XML_ERROR_MESSAGES: {
    readonly INVALID_CHARACTER: "Invalid character in XML";
    readonly MALFORMED_TAG: "Malformed tag";
    readonly UNCLOSED_TAG: "Unclosed tag";
    readonly MISMATCHED_TAG: "Mismatched tags";
    readonly DUPLICATE_ATTRIBUTE: "Duplicate attribute";
    readonly INVALID_ATTRIBUTE: "Invalid attribute";
    readonly MISSING_ROOT: "Missing root element";
    readonly MULTIPLE_ROOTS: "Multiple root elements";
    readonly INVALID_NESTING: "Invalid nesting";
    readonly INVALID_CDATA: "Invalid CDATA section";
    readonly INVALID_COMMENT: "Invalid comment";
    readonly INVALID_PI: "Invalid processing instruction";
    readonly INVALID_DOCTYPE: "Invalid DOCTYPE declaration";
    readonly INVALID_NAMESPACE: "Invalid namespace";
    readonly UNDEFINED_PREFIX: "Undefined prefix";
    readonly XMLNS_PREFIX_RESERVED: "The \"xmlns\" prefix is reserved";
    readonly XML_PREFIX_URI: "The \"xml\" prefix must bind to the standard URI";
    readonly BAD_QNAME: "Invalid qualified name (QName)";
    readonly ATTR_MISSING_SPACE: "Space required after attribute value";
    readonly ATTR_NO_VALUE: "Attribute without value or unquoted value";
    readonly ENTITY_EXPANSION_LIMIT: "Entity expansion limit exceeded";
    readonly MAX_DEPTH_EXCEEDED: "Maximum depth exceeded";
    readonly MAX_TEXT_LENGTH_EXCEEDED: "Maximum text length exceeded";
    readonly RECOVERY_ATTEMPTED: "Recovery attempted";
    readonly PARTIAL_PARSE: "Partial parse performed";
};
/**
 * Suggestions de correction par défaut
 */
export declare const XML_ERROR_SUGGESTIONS: {
    readonly INVALID_CHARACTER: "Check file encoding";
    readonly MALFORMED_TAG: "Verify tag syntax";
    readonly UNCLOSED_TAG: "Add the corresponding closing tag";
    readonly MISMATCHED_TAG: "Verify tag pairing";
    readonly DUPLICATE_ATTRIBUTE: "Remove the duplicate attribute";
    readonly INVALID_ATTRIBUTE: "Verify attribute syntax";
    readonly MISSING_ROOT: "Add a root element";
    readonly MULTIPLE_ROOTS: "Remove extra root elements";
    readonly INVALID_NESTING: "Verify element nesting";
    readonly INVALID_CDATA: "Verify CDATA syntax";
    readonly INVALID_COMMENT: "Verify comment syntax";
    readonly INVALID_PI: "Verify processing instruction syntax";
    readonly INVALID_DOCTYPE: "Verify DOCTYPE syntax";
    readonly INVALID_NAMESPACE: "Verify namespace declaration";
    readonly UNDEFINED_PREFIX: "Define the prefix or declare it with xmlns";
    readonly XMLNS_PREFIX_RESERVED: "Do not use \"xmlns\" as an application prefix";
    readonly XML_PREFIX_URI: "Use http://www.w3.org/XML/1998/namespace for \"xml\"";
    readonly BAD_QNAME: "Limit QName to a single \":\" and a valid name";
    readonly ATTR_MISSING_SPACE: "Add a space before the next attribute";
    readonly ATTR_NO_VALUE: "Quote the attribute value with \" or '";
    readonly ENTITY_EXPANSION_LIMIT: "Reduce entity complexity";
    readonly MAX_DEPTH_EXCEEDED: "Reduce nesting depth";
    readonly MAX_TEXT_LENGTH_EXCEEDED: "Reduce text length";
    readonly RECOVERY_ATTEMPTED: "The parser attempted automatic recovery";
    readonly PARTIAL_PARSE: "Parsing was performed partially";
};
