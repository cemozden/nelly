import { LanguageManager, InvalidLanguageFileError } from "./LanguageManager";
import { Language, DEFAULT_ENGLISH_LANGUAGE } from "./Language";
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "fs";
import { sep } from "path";
import logger from "../utils/Logger";

/**
 * The language manager class that manages Nelly UI language by using loadLanguage method.
 * The class also provides getLanguageCount() method to retrieve the number of languages available in the system.
 * @author cemozden
 * @see LanguageManager
 */
export default class JSONLanguageManager implements LanguageManager {

    private readonly LANGUAGE_FOLDER_PATH : string;
    private readonly ENGLISH_LANGUAGE_FILE_NAME = 'lang_en.json';
    private readonly LANGUAGE_FILE_PATTERN : string = 'lang_[a-z]{2}\.json';
    private readonly LOG_LABEL : string = 'LanguageManager';
    
    constructor(languageFolderPath : string) {
        
        if(!existsSync(languageFolderPath))
            mkdirSync(languageFolderPath);

        const englishLanguageFilePath = `${languageFolderPath}${sep}${this.ENGLISH_LANGUAGE_FILE_NAME}`;

        // If there is no "lang_*.json" file in the language folder then create default english language file.
        if(readdirSync(languageFolderPath)
            .filter(fileName => fileName.match(this.LANGUAGE_FILE_PATTERN) !== null).length === 0){
                logger.info(`[${this.LOG_LABEL}] No language file exist! Creating the english language file.`);
                writeFileSync(englishLanguageFilePath, JSON.stringify(DEFAULT_ENGLISH_LANGUAGE));
                logger.info(`[${this.LOG_LABEL}] English language file created. Path: ${englishLanguageFilePath}`);
            }
            
        
        this.LANGUAGE_FOLDER_PATH = languageFolderPath;
    }

    /**
     * The method that returns the language according to the language alias provided as parameter.
     * @param langAlias The alias of the language to be loaded. Such as "en" for lang_en.json file.
     * @throws InvalidLanguageFileError when the language file does not exist according to the language alias.
     * @returns Language object that contains the specific language statements.
     */
    loadLanguage(langAlias : string) : Language {

        const langFilePath = `${this.LANGUAGE_FOLDER_PATH}${sep}lang_${langAlias}.json`;

        if (!existsSync(langFilePath))
            throw new InvalidLanguageFileError(`The language file does not exist! Language File Path: ${langFilePath}`);

        const language : Language = JSON.parse(readFileSync(langFilePath).toString());

        return language;
    }

    /**
     * Returns the number of languages available in the system by checking the lang folder according to the language file pattern.
     * @returns number of languages available.
     */
    getLanguageCount() : number {
        return readdirSync(this.LANGUAGE_FOLDER_PATH)
            .filter(fileName => fileName.match(this.LANGUAGE_FILE_PATTERN)).length;
    }

}