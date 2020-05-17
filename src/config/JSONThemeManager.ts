import { ThemeManager, Theme, ThemeNotFoundError } from "./ThemeManager";
import { sep } from "path";
import { existsSync, readFileSync } from "fs";
import { ConfigFileNotFoundError } from "./SettingsManager";

export default class JSONThemeManager implements ThemeManager {
    
    private THEMES : Theme[];

    constructor(themesFolderPath : string) {
        const themesJSONFilePath = `${themesFolderPath}${sep}themes.json`;

        if (!existsSync(themesJSONFilePath))
            throw new ConfigFileNotFoundError(`themes.json file cannot be found in themes folder! Path: ${themesJSONFilePath}`);
        
        const availableThemes : Theme[] = JSON.parse(readFileSync(themesJSONFilePath).toString());

        availableThemes.forEach(theme => {
            const themeFilePath = `${themesFolderPath}${sep}${theme.filename}`;

            if (!existsSync(themeFilePath)) {
                throw new ThemeNotFoundError(`${theme.name} theme cannot be found! Path: ${themeFilePath}`);
            }
        });

        this.THEMES = availableThemes;
    }

    getThemeById(id: string): Theme {
        
        if (typeof id !== 'string') throw new ThemeNotFoundError(`The id of the theme is not a valid id! Given id: ${id}`);

        const filteredThemes = this.THEMES.filter(theme => theme.id === id);

        if (filteredThemes.length === 0)
            throw new ThemeNotFoundError(`A theme with the given id "${id}" cannot be found in the system!`);
        else return filteredThemes[0];
    }

    getThemes(): Theme[] {
        return this.THEMES;
    }

}