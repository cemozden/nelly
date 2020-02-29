import express from "express";
import { ConfigManager } from "./config/ConfigManager";
import JSONConfigManager from "./config/JSONConfigManager";
import { sep } from "path";
import { SettingsManager } from "./config/SettingsManager";
import logger from "./utils/Logger";

process.env.CONFIG_DIR = `${process.env.HOME}${sep}`;
process.env.LOGS_DIR = `${process.env.APPLICATION_DIR}${sep}logs${sep}`;
process.env.DATABASE_FOLDER = `${process.env.APPLICATION_DIR}${sep}`;

const exp = express();

const configManager: ConfigManager = new JSONConfigManager(process.env.CONFIG_DIR);
const settingsManager : SettingsManager = configManager.getSettingsManager();

console.log(process.env.NODE_ENV);

exp.get('/', (req, res) => {
    res.json({name : "Cem", surname : "Ozden"})
});

const serverPort = settingsManager.getSettings().serverPort;

exp.listen(serverPort, () => {
    logger.info(`[EntryPoint] Express HTTP Server has started listening on localhost:${serverPort}.`);
});