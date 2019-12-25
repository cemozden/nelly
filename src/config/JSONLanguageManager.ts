import { LanguageManager, InvalidLanguageFileError } from "./LanguageManager";
import { Language, DEFAULT_ENGLISH_LANGUAGE } from "./Language";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { sep } from "path";

export default class JSONLanguageManager implements LanguageManager {

    private readonly LANGUAGE_FOLDER_PATH : string;
    private readonly ENGLISH_LANGUAGE_FILE_NAME = 'lang_en.json';

    constructor(languageFolderPath : string) {
        
        if(!existsSync(languageFolderPath))
            mkdirSync(languageFolderPath);

        const englishLanguageFilePath = `${languageFolderPath}${sep}${this.ENGLISH_LANGUAGE_FILE_NAME}`;

        if(!existsSync(englishLanguageFilePath)){
            writeFileSync(englishLanguageFilePath, JSON.stringify(DEFAULT_ENGLISH_LANGUAGE));
        }

        this.LANGUAGE_FOLDER_PATH = languageFolderPath;
    }

    loadLanguage(langAlias : string) : Language {

        const langFilePath = `${this.LANGUAGE_FOLDER_PATH}${sep}lang_${langAlias}.json`;

        if (!existsSync(langFilePath))
            throw new InvalidLanguageFileError(`The language file does not exist! Language File Path: ${langFilePath}`);

        const language : Language = JSON.parse(readFileSync(langFilePath).toString());

        return language;
    }

}