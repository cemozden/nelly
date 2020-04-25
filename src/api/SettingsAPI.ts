import { SettingsManager, SystemSettings } from "../config/SettingsManager";
import Express from "express";
import Duration from "../time/Duration";
import general_logger, { http_logger } from "../utils/Logger";

const SECONDS_TO_WAIT_FOR_RESTART = 15;

export default function SettingsAPI(express : Express.Application, settingsManager : SettingsManager) {
    
    express.get('/updatesettings', async (req, res) => {

        const params = req.query;

        const serverPort : number = parseInt(params.serverPort as string);
        const archiveCleaningPeriod : Duration = params.archiveCleaningPeriod !== undefined ? JSON.parse(params.archiveCleaningPeriod as string) : {};
        const systemLocale = params.systemLocale as string;

        if (serverPort === undefined || isNaN(serverPort)) {
            const errorMessage =  'Server Port is not a valid number! Please provide a valid number to set server port.';
            
            res.status(400).json({ settingsUpdated : false, message : errorMessage });
            http_logger.error(`[UpdateSettings] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if (archiveCleaningPeriod === undefined || archiveCleaningPeriod.unit === undefined || archiveCleaningPeriod.value === undefined || isNaN(archiveCleaningPeriod.value)) {
            const errorMessage =  'Archive Cleaning Period is not valid! Please provide a valid archive cleaning period.';
            
            res.status(400).json({ settingsUpdated : false, message : errorMessage });
            http_logger.error(`[UpdateSettings] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        if (systemLocale === undefined || systemLocale.length === 0) {
            const errorMessage =  'System locale is not a valid locale! Please provide a valid system locale to update settings.';
            
            res.status(400).json({ settingsUpdated : false, message : errorMessage });
            http_logger.error(`[UpdateSettings] ${errorMessage}, Request params: ${JSON.stringify(params)}`);
            
            return;
        }

        const oldSettings = settingsManager.getSettings();
        const newSettings : SystemSettings = {
            archiveCleaningPeriod,
            language : oldSettings.language,
            serverPort,
            systemLocale
        };

        const settingsUpdated = await settingsManager.writeSettings(newSettings);

        if (settingsUpdated) {

            // If locale or server port is changed, then restart the application.
            if (oldSettings.systemLocale !== newSettings.systemLocale || oldSettings.serverPort !== newSettings.serverPort) {
                setTimeout(function () {
                    process.on("exit", function () {
                        require("child_process").spawn(process.argv.shift(), process.argv, {
                            cwd: process.cwd(),
                            detached : true,
                            stdio: "inherit"
                        });
                    });
                    general_logger.warn(`[UpdateSettings] Either system locale or server port changed! Application is being restarted!`);
                    process.exit();
                }, SECONDS_TO_WAIT_FOR_RESTART * 1000);
            }

            http_logger.info(`[UpdateSettings] System settings updated! Old Settings: ${JSON.stringify(oldSettings)}, New Settings: ${JSON.stringify(newSettings)}`);
            res.json({ settingsUpdated : true, localeUpdated : oldSettings.systemLocale !== newSettings.systemLocale, portUpdated : oldSettings.serverPort !== newSettings.serverPort, settings : newSettings });
        }
        else {
            http_logger.error(`[UpdateSettings] An error occured while updating system settings! Request Params: ${JSON.stringify(params)}`);
            res.json({ settingsUpdated : false, message : 'An error occured while updating settings!' });
        }


    });

}