import { FeedScheduler } from "./FeedScheduler";
import { FeedConfig, InvalidFeedConfigIdError } from "../config/FeedConfigManager";
import { schedule, ScheduledTask } from "node-cron";
import { generateCronPattern } from "./CronPatternGenerator";
import { collectFeed } from "../collectors/FeedCollector";
import general_logger from "../utils/Logger";
import { Server, Namespace } from "socket.io";
import { TimeUnit } from "../time/TimeUnit";

/**
 * The feed scheduler that schedules using cron style job system.
 * @author cemozden
 */
export default class CronFeedScheduler implements FeedScheduler {
    
    private readonly scheduledTaskMap = new Map<string, ScheduledTask>();

    constructor(private socketList : Namespace[]) {}

    addFeedToSchedule(feedConfig: FeedConfig): void {
        const feedConfigId = feedConfig.feedConfigId;

        if (this.getScheduledTask(feedConfigId) !== undefined) {
            const message = `Invalid Feed Configuration! There already exist a task which has the same id as "${feedConfigId}"`;
            general_logger.error('[CronFeedScheduler->addFeedToSchedule] ' + message);
            throw new InvalidFeedConfigIdError(message);
        }
            
        console.log(`Processing scheduling for the feed "${feedConfig.name}"`);
        const cronExpression = generateCronPattern(feedConfig.fetchPeriod);
        
        // First fetch all data then schedule.
        if (feedConfig.enabled)
            collectFeed(feedConfig, this.socketList);
        else 
            console.log(`The feed "${feedConfig.name} is disabled in config. No feed collection will occur..."`);
        

        const task = schedule(cronExpression, () => collectFeed(feedConfig, this.socketList), {
            scheduled : feedConfig.enabled
        });

        this.scheduledTaskMap.set(feedConfigId, task);
        
        if(feedConfig.enabled) {
            console.log(`The feed "${feedConfig.name}" is scheduled for receiving new feeds. Source: ${feedConfig.url}, Fetch Period: ${feedConfig.fetchPeriod.value} ${TimeUnit[feedConfig.fetchPeriod.unit]}`);
            general_logger.info(`[CronFeedScheduler->addFeedToSchedule] ${feedConfig.name} is scheduled for receiving feeds.`);
        }

    }

    getScheduledTaskCount(): number {
        return this.scheduledTaskMap.size;
    }

    getScheduledTask(feedConfigId: string): ScheduledTask | undefined {
        return this.scheduledTaskMap.get(feedConfigId);
    }

    stopTask(feedConfigId: string): void {
        const task = this.getScheduledTask(feedConfigId);
        
        if (task === undefined) {
            const message = `The given feed config id "${feedConfigId}" does not exist in the scheduler!`;
            general_logger.error('[CronFeedScheduler->stopTask]' + message);
            throw new InvalidFeedConfigIdError(message);
        }

        task.stop();
        general_logger.info(`[CronFeedScheduler->stopTask] A task with the id "${feedConfigId}" is stopped.`);
    }

    startTask(feedConfigId: string): void {
        const task = this.getScheduledTask(feedConfigId);
        if (task === undefined) {
            const message = `The given feed config id "${feedConfigId}" does not exist in the scheduler!`;
            general_logger.error('[CronFeedScheduler->startTask]' + message);
            throw new InvalidFeedConfigIdError(message);
        }

        task.start();
        general_logger.info(`[CronFeedScheduler->stopTask] A task with the id "${feedConfigId}" is started.`);
    }

    deleteScheduledTask(feedConfigId: string): void {
        const task = this.getScheduledTask(feedConfigId);
        
        if (task === undefined) {
            const message = `The given feed config id "${feedConfigId}" does not exist in the scheduler!`;
            general_logger.error('[CronFeedScheduler->deleteScheduledTask]' + message);
            throw new InvalidFeedConfigIdError(message);
        }

        task.destroy();
        this.scheduledTaskMap.delete(feedConfigId);
        general_logger.info(`[CronFeedScheduler->deleteScheduledTask] A task with the id "${feedConfigId}" is destroyed and removed.`);
    }

}