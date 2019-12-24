import JSONConfigManager from "./JSONConfigManager";
import { ConfigPathNotAvailableError, InvalidConfigPathError } from "./ConfigManager";
import { join } from "path";
import { existsSync } from "fs";
import { sync } from "rimraf";

describe('ConfigManager', () => {
    const tmpConfigFolder = join(__dirname, '../../testresources/config');

    describe('JSONConfigManager', () => {
        
        it('should throw an error when config path is not string.', () => {
            
            expect(() => { new JSONConfigManager(undefined) })
                .toThrowError(new ConfigPathNotAvailableError('Configuration folder path is not a string.'));

        });

        it('should create the "config" folder if it does not exist', () => {

            const configManager = new JSONConfigManager(tmpConfigFolder);

            expect(existsSync(tmpConfigFolder)).toBe(true);
        });


    });

    afterAll(() => {
        //Clean up the temporary config folder.
        sync(tmpConfigFolder); 
    });

});