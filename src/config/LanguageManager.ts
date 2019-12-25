import { Language } from "./Language";

export interface LanguageManager {
    loadLanguage(langAlias : string) : Language
}

export class InvalidLanguageFileError extends Error {

    constructor(message : string) {
        super(message);
    }

}