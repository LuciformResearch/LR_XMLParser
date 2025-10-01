/**
 * Diagnostics - Gestion des erreurs et avertissements XML
 *
 * Système de diagnostic pour le parser XML avec codes d'erreur
 * et suggestions de correction
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
     * Ajoute un diagnostic
     */
    addDiagnostic(diagnostic: Diagnostic): void;
    /**
     * Ajoute une erreur
     */
    addError(code: string, message: string, location?: Location, suggestion?: string): void;
    /**
     * Ajoute un avertissement
     */
    addWarning(code: string, message: string, location?: Location, suggestion?: string): void;
    /**
     * Ajoute une info
     */
    addInfo(code: string, message: string, location?: Location, suggestion?: string): void;
    /**
     * Incrémente le compteur de récupération
     */
    incrementRecovery(code?: string): void;
    /**
     * Obtient tous les diagnostics
     */
    getDiagnostics(): Diagnostic[];
    /**
     * Obtient les erreurs
     */
    getErrors(): Diagnostic[];
    /**
     * Obtient les avertissements
     */
    getWarnings(): Diagnostic[];
    /**
     * Obtient les infos
     */
    getInfos(): Diagnostic[];
    /**
     * Obtient le nombre de récupérations
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
     * Indique si la limite de récupération a été dépassée
     */
    isRecoveryCapped(): boolean;
    /**
     * Vérifie s'il y a des erreurs
     */
    hasErrors(): boolean;
    /**
     * Vérifie s'il y a des avertissements
     */
    hasWarnings(): boolean;
    /**
     * Remet à zéro les diagnostics
     */
    reset(): void;
    /**
     * Obtient un résumé des diagnostics
     */
    getSummary(): {
        total: number;
        errors: number;
        warnings: number;
        infos: number;
        recoveries: number;
    };
    /**
     * Ajoute une note de récupération (pour le rapport)
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
    readonly INVALID_CHARACTER: "Caractère invalide dans le XML";
    readonly MALFORMED_TAG: "Balise malformée";
    readonly UNCLOSED_TAG: "Balise non fermée";
    readonly MISMATCHED_TAG: "Balises non appariées";
    readonly DUPLICATE_ATTRIBUTE: "Attribut dupliqué";
    readonly INVALID_ATTRIBUTE: "Attribut invalide";
    readonly MISSING_ROOT: "Élément racine manquant";
    readonly MULTIPLE_ROOTS: "Plusieurs éléments racines";
    readonly INVALID_NESTING: "Imbrication invalide";
    readonly INVALID_CDATA: "Section CDATA invalide";
    readonly INVALID_COMMENT: "Commentaire invalide";
    readonly INVALID_PI: "Instruction de traitement invalide";
    readonly INVALID_DOCTYPE: "Déclaration DOCTYPE invalide";
    readonly INVALID_NAMESPACE: "Namespace invalide";
    readonly UNDEFINED_PREFIX: "Préfixe non défini";
    readonly XMLNS_PREFIX_RESERVED: "Le préfixe \"xmlns\" est réservé";
    readonly XML_PREFIX_URI: "Le préfixe \"xml\" doit être lié à l'URI standard";
    readonly BAD_QNAME: "Nom qualifié (QName) invalide";
    readonly ATTR_MISSING_SPACE: "Espace requis après la valeur de l'attribut";
    readonly ATTR_NO_VALUE: "Attribut sans valeur ou valeur non quotée";
    readonly ENTITY_EXPANSION_LIMIT: "Limite d'expansion d'entité dépassée";
    readonly MAX_DEPTH_EXCEEDED: "Profondeur maximale dépassée";
    readonly MAX_TEXT_LENGTH_EXCEEDED: "Longueur de texte maximale dépassée";
    readonly RECOVERY_ATTEMPTED: "Tentative de récupération";
    readonly PARTIAL_PARSE: "Parse partiel effectué";
};
/**
 * Suggestions de correction par défaut
 */
export declare const XML_ERROR_SUGGESTIONS: {
    readonly INVALID_CHARACTER: "Vérifiez l'encodage du fichier";
    readonly MALFORMED_TAG: "Vérifiez la syntaxe de la balise";
    readonly UNCLOSED_TAG: "Ajoutez la balise de fermeture correspondante";
    readonly MISMATCHED_TAG: "Vérifiez l'appariement des balises";
    readonly DUPLICATE_ATTRIBUTE: "Supprimez l'attribut dupliqué";
    readonly INVALID_ATTRIBUTE: "Vérifiez la syntaxe de l'attribut";
    readonly MISSING_ROOT: "Ajoutez un élément racine";
    readonly MULTIPLE_ROOTS: "Supprimez les éléments racines supplémentaires";
    readonly INVALID_NESTING: "Vérifiez l'imbrication des éléments";
    readonly INVALID_CDATA: "Vérifiez la syntaxe CDATA";
    readonly INVALID_COMMENT: "Vérifiez la syntaxe du commentaire";
    readonly INVALID_PI: "Vérifiez la syntaxe de l'instruction de traitement";
    readonly INVALID_DOCTYPE: "Vérifiez la syntaxe DOCTYPE";
    readonly INVALID_NAMESPACE: "Vérifiez la déclaration du namespace";
    readonly UNDEFINED_PREFIX: "Définissez le préfixe ou utilisez xmlns";
    readonly XMLNS_PREFIX_RESERVED: "N'utilisez pas \"xmlns\" comme préfixe applicatif";
    readonly XML_PREFIX_URI: "Utilisez http://www.w3.org/XML/1998/namespace pour \"xml\"";
    readonly BAD_QNAME: "Limitez le QName à un seul \":\" et un nom valide";
    readonly ATTR_MISSING_SPACE: "Ajoutez un espace avant le prochain attribut";
    readonly ATTR_NO_VALUE: "Entourez la valeur d'apostrophes ou guillemets";
    readonly ENTITY_EXPANSION_LIMIT: "Réduisez la complexité des entités";
    readonly MAX_DEPTH_EXCEEDED: "Réduisez la profondeur d'imbrication";
    readonly MAX_TEXT_LENGTH_EXCEEDED: "Réduisez la longueur du texte";
    readonly RECOVERY_ATTEMPTED: "Le parser a tenté de récupérer automatiquement";
    readonly PARTIAL_PARSE: "Le parsing a été effectué partiellement";
};
