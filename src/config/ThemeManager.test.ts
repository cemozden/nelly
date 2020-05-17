import { cp } from "shelljs";
import { sep } from "path";
import JSONThemeManager from "./JSONThemeManager";
import { ConfigFileNotFoundError } from "./SettingsManager";
import { existsSync, mkdirSync } from "fs";
import { ThemeNotFoundError } from "./ThemeManager";
import { sync } from "rimraf";

describe('ThemeManager', () => {

    const THEMES_DIR = `${process.env.CONFIG_DIR}${sep}themes${sep}`;

    describe('JSONThemeManager', () => {
        
        it('should throw an error if themes.json file cannot be found inside themes folder.', () => {
            expect(() => { new JSONThemeManager(process.env.CONFIG_DIR as string); }).toThrowError(new ConfigFileNotFoundError(`themes.json file cannot be found in themes folder! Path: ${process.env.CONFIG_DIR + sep + 'themes.json'}`));
        });

        it('should throw an error if a theme file cannot be found in themes folder.', () => {
            if (!existsSync(THEMES_DIR))
                mkdirSync(THEMES_DIR);

            cp(`${process.env.APPLICATION_DIR}${sep}assets${sep}css${sep}themes${sep}themes.json`, THEMES_DIR);
            expect(() => { new JSONThemeManager(THEMES_DIR) }).toThrowError(new ThemeNotFoundError(`Dark Purple theme cannot be found! Path: ${THEMES_DIR + sep + 'darkpurple.css'}`));
        });

        describe('#getThemes()', () => {
            it('should yield the list of theme configuration', () => {
                cp('-r', `${process.env.APPLICATION_DIR}${sep}assets${sep}css${sep}themes${sep}`, process.env.CONFIG_DIR);
                
                const themeManager = new JSONThemeManager(THEMES_DIR);
                const themes = themeManager.getThemes();

                expect(themes.length).toBeGreaterThan(0);
            });

        });

        describe('#getThemeById(id : string)', () => {
            it('should throw an error if given parameter is not a valid string', () => {
                const themeManager = new JSONThemeManager(THEMES_DIR);

                expect(() => { themeManager.getThemeById(undefined as string) }).toThrowError(`The id of the theme is not a valid id! Given id: undefined`);
            });

            it('should throw an error if a theme with a given id is not found', () => {
                const themeManager = new JSONThemeManager(THEMES_DIR);

                expect(() => { themeManager.getThemeById('1') }).toThrowError(`A theme with the given id "1" cannot be found in the system!`);
            });

            it('should yield the theme with the given id', () => {
                const themeManager = new JSONThemeManager(THEMES_DIR);

                expect(themeManager.getThemeById('dark_purple')).toEqual({
                    name: "Dark Purple",
                    id : "dark_purple",
                    filename : "darkpurple.css"
                });
            });

        });
    });

    beforeAll(() => {
        sync(THEMES_DIR);
    });

});