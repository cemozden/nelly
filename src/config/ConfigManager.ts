export interface ConfigManager {
    
   
}

export class ConfigPathNotAvailableError extends Error {
    
    constructor(message : string) {
        super(message);
    }

}