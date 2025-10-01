/**
 * LuciformXMLScanner - Scanner XML robuste
 *
 * Tokenizer à états pour parser XML avec gestion des erreurs
 * et mode permissif pour récupération d'erreurs
 */
import { Token, ScannerState } from './types';
export declare class LuciformXMLScanner {
    private content;
    private position;
    private line;
    private column;
    private state;
    constructor(content: string);
    /**
     * Token suivant avec gestion d'états
     */
    next(): Token | null;
    private scanText;
    private scanTag;
    private scanEndTag;
    private scanComment;
    private scanProcessingInstruction;
    private scanCDATA;
    private scanDoctype;
    private readTagName;
    private readAttributes;
    private readAttributeName;
    private readAttributeValue;
    private advance;
    private getCurrentLocation;
    /**
     * Réinitialise le scanner
     */
    reset(): void;
    /**
     * Obtient la position actuelle
     */
    getPosition(): number;
    /**
     * Obtient l'état actuel
     */
    getState(): ScannerState;
}
