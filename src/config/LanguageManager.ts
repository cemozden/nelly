import { Language } from "./Language";

export interface LanguageManager {
    loadLanguage(langAlias : string) : Language,
    getLanguageCount() : number
}

export class InvalidLanguageFileError extends Error {

    constructor(message : string) {
        super(message);
    }

}