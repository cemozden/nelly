import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { sync } from "rimraf";
import JSONLanguageManager from "./JSONLanguageManager";
import { sep } from "path";
import { Language, DEFAULT_ENGLISH_LANGUAGE } from "./Language";
import { InvalidLanguageFileError } from "./LanguageManager";

describe('LanguageManager', () => {
    const tmpLanguageFolderPath = join(__dirname, '../../testresources/lang');

    describe('JSONLanguageManager', () => {

        it('should create "language" folder if it does not exist', () => {        
            const languageManager = new JSONLanguageManager(tmpLanguageFolderPath);

            expect(existsSync(tmpLanguageFolderPath)).toBe(true);
            sync(tmpLanguageFolderPath);
        });

        it('should create the english language file if the folder does not contain any "lang_*.json" file', () => {
            // Write dummy file to lang folder in order to check that the constructor only looks for lang_*.json files
            mkdirSync(tmpLanguageFolderPath);
            writeFileSync(`${tmpLanguageFolderPath}${sep}dummy.json`, JSON.stringify({}));
            sync(tmpLanguageFolderPath);

            const languageManager = new JSONLanguageManager(tmpLanguageFolderPath);
            const englishLanguageFilePath = `${tmpLanguageFolderPath}${sep}lang_en.json`;

            expect(existsSync(englishLanguageFilePath)).toBe(true);

            const englishLanguage : Language = JSON.parse(readFileSync(englishLanguageFilePath).toString());
            
            expect(englishLanguage).toEqual(DEFAULT_ENGLISH_LANGUAGE);
        });

        describe('#loadLanguage(langAlias : string)', () => {
            it('should throw an error if it doesn\'t find the language file according to the "langAlias" parameter', () => {
                const languageManager = new JSONLanguageManager(tmpLanguageFolderPath);
                const languageAlias = 'AAA';
                const languageFilePath = `${tmpLanguageFolderPath}${sep}lang_${languageAlias}.json`;
                
                expect(() => { languageManager.loadLanguage(languageAlias); })
                    .toThrowError(new InvalidLanguageFileError(`The language file does not exist! Language File Path: ${languageFilePath}`));

            });
        });

    });

    afterAll(() => {
        sync(tmpLanguageFolderPath);
    })
});