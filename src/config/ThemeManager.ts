/**
 * Theme manager that manages available themes defined in the Nelly.
 * Themes are stored in assets/css/themes folder.
 * There must be themes.json inside of themes folder.
 * The implementor should
 * @throws ConfigFileNotFoundError if themes.json file not found.
   @throws ThemeNotExistError if a specific theme defined in themes.json file cannot be found.
 */
export interface ThemeManager {
    /**
     * The method that retrieves the list of available themes defined in the system.
     */
    getThemes() : Theme[],

    /**
     * The method that yields a specific theme by its id.
     * @param id The id of a specific theme
     */
    getThemeById(id : string) : Theme
}

export interface Theme {
    id : string,
    name : string,
    filename : string
}

export class ThemeNotFoundError extends Error {}