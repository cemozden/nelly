import Express from "express";
import FeedCategoryAPI from "./FeedCategoryAPIs";
import { ConfigManager } from "../config/ConfigManager";
import { FeedScheduler } from "../scheduler/FeedScheduler";
import FeedAPI from "./FeedAPIs";
import SettingsAPI from "./SettingsAPI";
import { Namespace } from "socket.io";

export default function initAPIs(express : Express.Application, configManager : ConfigManager, feedScheduler : FeedScheduler, socketList: Namespace[]) {
    FeedCategoryAPI(express, configManager);
    FeedAPI(express, configManager, feedScheduler, socketList);
    SettingsAPI(express, configManager.getSettingsManager());
}