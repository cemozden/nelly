import Express from "express";
import FeedCategoryAPI from "./FeedCategoryAPIs";
import { ConfigManager } from "../config/ConfigManager";

export default function initAPIs(express : Express.Application, configManager : ConfigManager) {
    FeedCategoryAPI(express, configManager);
    
}