import { FeedConfig } from "../config/FeedConfigManager";
import { ScheduledTask } from "node-cron";
import { Server } from "socket.io";

/**
 * The interface that describes scheduling of feeds according to their setup.
 * @author cemozden
 */
export interface FeedScheduler {
    /**
     * The method that adds a specific feed for scheduling. If the given feed has the property active with true value,
     * then the method automatically activates cron job immediately.
     * @param feedConfig The configuration object of a specific feed that needs to be scheduled.
     * @throws InvalidFeedConfigIdError if a task for the given feed config is alreadt defined.
     */
    addFeedToSchedule(feedConfig : FeedConfig) : void,
    
    /**
     * The method that returns the number of scheduled tasks
     */
    getScheduledTaskCount() : number,

    /**
     * The method that returns a specific task added. Returns undefined if the task does not exist
     * @param feedConfigId The id of the scheduled task. Same as the id of the feed.
     */
    getScheduledTask(feedConfigId : string) : ScheduledTask | undefined,

    /**
     * The method that destroys as well as deletes a specific scheduled task defined by receiving its id.
     * @param feedConfigId The id of the scheduled task. Same as the id of the feed.
     * @throws InvalidFeedConfigIdError if feed config id does not exist.
     */
    deleteScheduledTask(feedConfigId : string) : void,

    /**
     * The method that stops a specific task by receiving its id.
     * @param feedConfigId The id of the scheduled task. Same as the id of the feed.
     * @throws InvalidFeedConfigIdError if feed config id does not exist.
     */
    stopTask(feedConfigId : string) : void,
    
    /**
     * The method that starts a specific task by receiving its id.
     * @param feedConfigId The id of the scheduled task. Same as the id of the feed.
     * @throws InvalidFeedConfigIdError if feed config id does not exist.
     */
    startTask(feedConfigId : string) : void,
}