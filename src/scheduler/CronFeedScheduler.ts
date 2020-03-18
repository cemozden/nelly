import { FeedScheduler } from "./FeedScheduler";
import { FeedConfig, InvalidFeedConfigIdError } from "../config/FeedConfigManager";
import { schedule, ScheduledTask } from "node-cron";
import { generateCronPattern } from "./CronPatternGenerator";
import { collectFeed } from "../collectors/FeedCollector";
import logger from "../utils/Logger";

/**
 * The feed scheduler that schedules using cron style job system.
 * @author cemozden
 */
export default class CronFeedScheduler implements FeedScheduler {
    
    private readonly scheduledTaskMap = new Map<string, ScheduledTask>();

    private feedCollector(feedConfig : FeedConfig) {
        collectFeed(feedConfig).catch(reason => {
            //TODO: In case of failure during collection then send it message using Socket.IO
        });
    }

    addFeedToSchedule(feedConfig: FeedConfig): void {
        const feedConfigId = feedConfig.feedConfigId;

        if (this.getScheduledTask(feedConfigId) !== undefined) {
            const message = `Invalid Feed Configuration! There already exist a task which has the same id as "${feedConfigId}"`;
            logger.error('[CronFeedScheduler->addFeedToSchedule] ' + message);
            throw new InvalidFeedConfigIdError(message);
        }
            

        const cronExpression = generateCronPattern(feedConfig.fetchPeriod);
        
        // First fetch all data then schedule.
        if (feedConfig.enabled)
            this.feedCollector(feedConfig);

        const task = schedule(cronExpression, () => {
            this.feedCollector(feedConfig);
        },{
            scheduled : feedConfig.enabled
        });

        this.scheduledTaskMap.set(feedConfigId, task);
        logger.debug(`[CronFeedScheduler->addFeedToSchedule] The feed that is added ${JSON.stringify(feedConfig)}`);
        
        if(feedConfig.enabled)
            logger.info(`[CronFeedScheduler->addFeedToSchedule] ${feedConfig.name} is scheduled for receiving feeds.`);
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
            logger.error('[CronFeedScheduler->stopTask]' + message);
            throw new InvalidFeedConfigIdError(message);
        }

        task.stop();
        logger.info(`[CronFeedScheduler->stopTask] A task with the id "${feedConfigId}" is stopped.`);
    }

    startTask(feedConfigId: string): void {
        const task = this.getScheduledTask(feedConfigId);
        if (task === undefined) {
            const message = `The given feed config id "${feedConfigId}" does not exist in the scheduler!`;
            logger.error('[CronFeedScheduler->startTask]' + message);
            throw new InvalidFeedConfigIdError(message);
        }

        task.start();
        logger.info(`[CronFeedScheduler->stopTask] A task with the id "${feedConfigId}" is started.`);
    }

    deleteScheduledTask(feedConfigId: string): void {
        const task = this.getScheduledTask(feedConfigId);
        
        if (task === undefined) {
            const message = `The given feed config id "${feedConfigId}" does not exist in the scheduler!`;
            logger.error('[CronFeedScheduler->deleteScheduledTask]' + message);
            throw new InvalidFeedConfigIdError(message);
        }

        task.destroy();
        this.scheduledTaskMap.delete(feedConfigId);
        logger.info(`[CronFeedScheduler->deleteScheduledTask] A task with the id "${feedConfigId}" is destroyed and removed.`);
    }

}