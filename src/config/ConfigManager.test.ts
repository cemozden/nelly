import JSONConfigManager from "./JSONConfigManager";
import { ConfigPathNotAvailableError } from "./ConfigManager";

describe('ConfigManager', () => {

    describe('JSONConfigManager', () => {
        
        it('should throw error when config path is not string.', () => {
            
            expect(() => { new JSONConfigManager(undefined) })
                .toThrowError(new ConfigPathNotAvailableError('Configuration folder path is not a string.'));

        });


    });

});