import Express from "express";
import ConfigAPI from "./ConfigAPI";
import { ConfigManager } from "../config/ConfigManager";

export default function initAPIs(express : Express.Application, configManager : ConfigManager) {
    ConfigAPI(express, configManager);
    
}