import Express from "express";
import FeedCategoryAPI from "./FeedCategoryAPIs";
import { ConfigManager } from "../config/ConfigManager";
import { FeedScheduler } from "../scheduler/FeedScheduler";
import FeedAPI from "./FeedAPIs";
import SettingsAPI from "./SettingsAPI";

export default function initAPIs(express : Express.Application, configManager : ConfigManager, feedScheduler : FeedScheduler) {
    FeedCategoryAPI(express, configManager);
    FeedAPI(express, configManager, feedScheduler);
    SettingsAPI(express, configManager.getSettingsManager());
}