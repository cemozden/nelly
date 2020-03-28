import CronFeedScheduler from "./CronFeedScheduler";
import { InvalidFeedConfigIdError, FeedConfig } from "../config/FeedConfigManager";
import { TimeUnit } from "../time/TimeUnit";

describe('FeedScheduler', () => {

    describe('CronFeedScheduler', () => {
        describe('#addFeedToSchedule(feedConfig : FeedConfig)', () => {
            it('should increase the number of scheduled cron jobs.', () => {
                const scheduler = new CronFeedScheduler();
                const numOfExistingScheduledTasks = scheduler.getScheduledTaskCount();

                const feedConfig : FeedConfig = {
                    categoryId : '123456789',
                    enabled : false,
                    feedConfigId : '123456789',
                    fetchPeriod : { unit : TimeUnit.MINUTES, value : 5},
                    name : 'Test Config',
                    url : 'https://example.com',
                    notifyUser : false
                };

                scheduler.addFeedToSchedule(feedConfig);

                expect(scheduler.getScheduledTaskCount()).toBe(numOfExistingScheduledTasks + 1);
            });

            it('should throw an error if a task is already existing', () => {
                const scheduler = new CronFeedScheduler();
                const numOfExistingScheduledTasks = scheduler.getScheduledTaskCount();

                const feedConfig : FeedConfig = {
                    categoryId : '123456789',
                    enabled : false,
                    feedConfigId : '123456789',
                    fetchPeriod : { unit : TimeUnit.MINUTES, value : 5},
                    name : 'Test Config',
                    url : 'https://example.com',
                    notifyUser : false
                };

                scheduler.addFeedToSchedule(feedConfig);
                expect(() => scheduler.addFeedToSchedule(feedConfig)).toThrowError(new InvalidFeedConfigIdError(`Invalid Feed Configuration! There already exist a task which has the same id as "${feedConfig.feedConfigId}"`));
            });

        });

        describe('#stopTask(feedConfigId: string)', () => {
            it('should throw an error if the giveen feedConfigId does not exist', () => {
                const scheduler = new CronFeedScheduler();
                const feedConfigId = 'non_exist_Id';
                
                expect(() => scheduler.stopTask(feedConfigId))
                    .toThrowError(new InvalidFeedConfigIdError(`The given feed config id "${feedConfigId}" does not exist in the scheduler!`));
            });
        });

        describe('#startTask(feedConfigId: string)', () => {
            it('should throw an error if the giveen feedConfigId does not exist', () => {
                const scheduler = new CronFeedScheduler();
                const feedConfigId = 'non_exist_Id';
                
                expect(() => scheduler.startTask(feedConfigId))
                    .toThrowError(new InvalidFeedConfigIdError(`The given feed config id "${feedConfigId}" does not exist in the scheduler!`));
            });
        });

        describe('#deleteScheduledTask(feedConfigId: string)', () => {
            it('should throw an error if given feed config id does not exist!', () => {
                const scheduler = new CronFeedScheduler();
                const feedConfigId = 'non_exist_Id';
                
                expect(() => scheduler.deleteScheduledTask(feedConfigId))
                    .toThrowError(new InvalidFeedConfigIdError(`The given feed config id "${feedConfigId}" does not exist in the scheduler!`));

            });

            it('should remove the the task from scheduled cron jobs', () => {
                const scheduler = new CronFeedScheduler();
                const feedConfig : FeedConfig = {
                    categoryId : '123456789',
                    enabled : false,
                    feedConfigId : '123456789',
                    fetchPeriod : { unit : TimeUnit.MINUTES, value : 5},
                    name : 'Test Config',
                    url : 'https://example.com',
                    notifyUser : false
                };

                scheduler.addFeedToSchedule(feedConfig);
                
                const numOfExistingScheduledTasks = scheduler.getScheduledTaskCount();

                scheduler.deleteScheduledTask(feedConfig.feedConfigId);

                expect(scheduler.getScheduledTaskCount()).toBe(numOfExistingScheduledTasks - 1);
            });

        });

    });


});