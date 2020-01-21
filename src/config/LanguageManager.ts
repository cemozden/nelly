import { Language } from "./Language";

/**
 * The language manager interface that specifies the core functionalities on system languages.
 * The classes that implement this interface are considered to be able to deal with system language related issues.
 */
export interface LanguageManager {
    loadLanguage(langAlias : string) : Language,
    getLanguageCount() : number
}

export class InvalidLanguageFileError extends Error {}