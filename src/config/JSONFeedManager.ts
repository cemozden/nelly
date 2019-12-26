import { FeedConfigManager, FeedConfig, FeedCategory, isFeedConfig, InvalidFeedConfigIdError } from "./FeedManager";
import { existsSync, mkdirSync, writeFile, readdirSync, readFileSync, rename } from "fs";
import { sep } from "path";
import { sync } from "rimraf";

export default class JSONFeedConfigManager implements FeedConfigManager {
    
    private readonly FEEDS_FOLDER : string;
    private readonly FEED_CONFIGS : FeedConfig[];
    private readonly FEED_CONFIG_FILE_PATTERN : string = '[a-zA-Z0-9]{8}\.json';
    
    constructor(feedsFolderPath : string) {
        this.FEED_CONFIGS = [];
        this.FEEDS_FOLDER = feedsFolderPath;

        if (!existsSync(feedsFolderPath))
            mkdirSync(feedsFolderPath);

        const feedConfigFiles = readdirSync(feedsFolderPath)
            .filter(fileName => fileName.match(this.FEED_CONFIG_FILE_PATTERN));

        feedConfigFiles.forEach(feedConfigFile => {
            const fileAbsolutePath = `${this.FEEDS_FOLDER}${sep}${feedConfigFile}`;
            const fcObject = JSON.parse(readFileSync(fileAbsolutePath).toString())

            if (isFeedConfig(fcObject))
                this.FEED_CONFIGS.push(fcObject);

        });

    }

    addFeedConfig(feed : FeedConfig) : Promise<boolean> {
        
        const feedJSON = JSON.stringify(feed);
        
        const addFeedPromise : Promise<boolean> = new Promise((resolve, reject) => {
            writeFile(`${this.FEEDS_FOLDER}${sep}${feed.feedId}.json`, feedJSON, (err) => {
                if (err) reject(err);
                else{
                   this.FEED_CONFIGS.push(feed);
                   resolve(true);
                } 
            });
        });

        return addFeedPromise;
    }

    updateFeedConfig(feedId : string, feed: FeedConfig): Promise<boolean> {
        const updatePromise = new Promise<boolean>((resolve, reject) => {
            const feedIdIndex = this.FEED_CONFIGS.map(fc => fc.feedId).indexOf(feedId);
            
            if (feedIdIndex === -1) 
                reject(new InvalidFeedConfigIdError(`Update failed. There is no feed config with the id "${feedId}".`));
            else {
                this.FEED_CONFIGS[feedIdIndex] = feed;
                
                const feedConfigFilePath = `${this.FEEDS_FOLDER}${sep}${feedId}.json`;
                writeFile(feedConfigFilePath, JSON.stringify(feed), err => {
                    if (err) reject(err);
                    else resolve(true);
                });
            }
            
        });

        return updatePromise;
    }
    
    deleteFeedConfig(feedId : string): Promise<boolean> {
        const deletePromise = new Promise<boolean>((resolve, reject) => {
            const feedIdIndex = this.FEED_CONFIGS.map(fc => fc.feedId).indexOf(feedId);
            
            if (feedIdIndex === -1) 
                reject(new InvalidFeedConfigIdError(`Deletion failed. There is no feed config with the id "${feedId}".`));
            else {
                this.FEED_CONFIGS.splice(feedIdIndex, 1);
                
                const feedConfigFilePath = `${this.FEEDS_FOLDER}${sep}${feedId}.json`;
                sync(feedConfigFilePath);
                
                resolve(true);
            }
        });

        return deletePromise;
    }

    addFeedCategory(feedCategory: FeedCategory): void {
        throw new Error("Method not implemented.");
    }
    updateFeedCategory(feedCategory: FeedCategory): void {
        throw new Error("Method not implemented.");
    }
    deleteFeedCategory(feedCategory: FeedCategory): void {
        throw new Error("Method not implemented.");
    }

    getFeedConfigs(): FeedConfig[] {
        return this.FEED_CONFIGS;
    }

    getFeedConfig(feedId: string): FeedConfig | null {
        const filteredFeedConfig = this.FEED_CONFIGS.filter(fc => fc.feedId === feedId);
        return filteredFeedConfig.length !== 0 ? filteredFeedConfig[0] : null;
    }

}

