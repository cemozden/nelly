import JSONSettingsManager from "./JSONSettingsManager";
import { join } from "path";
import { sync } from "rimraf";
import { existsSync, readFileSync } from "fs";
import { SystemSettings } from "./SettingsManager";

describe('SettingsManager', () => {
    const tmpSettingsFilePath = join(__dirname, '../../testresources/settings.json');

    describe('JSONSettingsManager', () => {
        it('should create the settings file with default properties if the file does not exist.', () => {
                    
          const settingsManager = new JSONSettingsManager(tmpSettingsFilePath);
          
          expect(existsSync(tmpSettingsFilePath)).toBe(true);

          const writtenDefaultSettings : SystemSettings = JSON.parse(readFileSync(tmpSettingsFilePath).toString());
          const defaultSettingsToExpect : SystemSettings = {
              language : "en",
              windowMaximized : false
          };

          expect(writtenDefaultSettings).toEqual(defaultSettingsToExpect);
        });
        
    });

    afterAll(() => {
        sync(tmpSettingsFilePath);
    });

});