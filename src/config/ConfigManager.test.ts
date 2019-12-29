import JSONConfigManager from "./JSONConfigManager";
import { ConfigPathNotAvailableError } from "./ConfigManager";
import { join } from "path";
import { existsSync } from "fs";
import { sync } from "rimraf";

describe('ConfigManager', () => {
    const tmpConfigFolder = join(process.env.CONFIG_DIR as string, 'config/');

    describe('JSONConfigManager', () => {
        
        it('should throw an error when config path is not string.', () => {
            
            expect(() => { new JSONConfigManager(undefined) })
                .toThrowError(new ConfigPathNotAvailableError('Configuration folder path is not a string.'));

        });

        it('should create the "config" folder if it does not exist', () => {
            sync(tmpConfigFolder);
            expect(existsSync(tmpConfigFolder)).toBe(false);
            const configManager = new JSONConfigManager(tmpConfigFolder);
        
            expect(existsSync(tmpConfigFolder)).toBe(true);
        });

    });

});