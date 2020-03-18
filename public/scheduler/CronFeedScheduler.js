"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var FeedConfigManager_1 = require("../config/FeedConfigManager");
var node_cron_1 = require("node-cron");
var CronPatternGenerator_1 = require("./CronPatternGenerator");
var FeedCollector_1 = require("../collectors/FeedCollector");
var Logger_1 = __importDefault(require("../utils/Logger"));
/**
 * The feed scheduler that schedules using cron style job system.
 * @author cemozden
 */
var CronFeedScheduler = /** @class */ (function () {
    function CronFeedScheduler() {
        this.scheduledTaskMap = new Map();
    }
    CronFeedScheduler.prototype.feedCollector = function (feedConfig) {
        FeedCollector_1.collectFeed(feedConfig).catch(function (reason) {
            //TODO: In case of failure during collection then send it message using Socket.IO
        });
    };
    CronFeedScheduler.prototype.addFeedToSchedule = function (feedConfig) {
        var _this = this;
        var feedConfigId = feedConfig.feedConfigId;
        if (this.getScheduledTask(feedConfigId) !== undefined) {
            var message = "Invalid Feed Configuration! There already exist a task which has the same id as \"" + feedConfigId + "\"";
            Logger_1.default.error('[CronFeedScheduler->addFeedToSchedule] ' + message);
            throw new FeedConfigManager_1.InvalidFeedConfigIdError(message);
        }
        var cronExpression = CronPatternGenerator_1.generateCronPattern(feedConfig.fetchPeriod);
        // First fetch all data then schedule.
        if (feedConfig.enabled)
            this.feedCollector(feedConfig);
        var task = node_cron_1.schedule(cronExpression, function () {
            _this.feedCollector(feedConfig);
        }, {
            scheduled: feedConfig.enabled
        });
        this.scheduledTaskMap.set(feedConfigId, task);
        Logger_1.default.debug("[CronFeedScheduler->addFeedToSchedule] The feed that is added " + JSON.stringify(feedConfig));
        if (feedConfig.enabled)
            Logger_1.default.info("[CronFeedScheduler->addFeedToSchedule] " + feedConfig.name + " is scheduled for receiving feeds.");
    };
    CronFeedScheduler.prototype.getScheduledTaskCount = function () {
        return this.scheduledTaskMap.size;
    };
    CronFeedScheduler.prototype.getScheduledTask = function (feedConfigId) {
        return this.scheduledTaskMap.get(feedConfigId);
    };
    CronFeedScheduler.prototype.stopTask = function (feedConfigId) {
        var task = this.getScheduledTask(feedConfigId);
        if (task === undefined) {
            var message = "The given feed config id \"" + feedConfigId + "\" does not exist in the scheduler!";
            Logger_1.default.error('[CronFeedScheduler->stopTask]' + message);
            throw new FeedConfigManager_1.InvalidFeedConfigIdError(message);
        }
        task.stop();
        Logger_1.default.info("[CronFeedScheduler->stopTask] A task with the id \"" + feedConfigId + "\" is stopped.");
    };
    CronFeedScheduler.prototype.startTask = function (feedConfigId) {
        var task = this.getScheduledTask(feedConfigId);
        if (task === undefined) {
            var message = "The given feed config id \"" + feedConfigId + "\" does not exist in the scheduler!";
            Logger_1.default.error('[CronFeedScheduler->startTask]' + message);
            throw new FeedConfigManager_1.InvalidFeedConfigIdError(message);
        }
        task.start();
        Logger_1.default.info("[CronFeedScheduler->stopTask] A task with the id \"" + feedConfigId + "\" is started.");
    };
    CronFeedScheduler.prototype.deleteScheduledTask = function (feedConfigId) {
        var task = this.getScheduledTask(feedConfigId);
        if (task === undefined) {
            var message = "The given feed config id \"" + feedConfigId + "\" does not exist in the scheduler!";
            Logger_1.default.error('[CronFeedScheduler->deleteScheduledTask]' + message);
            throw new FeedConfigManager_1.InvalidFeedConfigIdError(message);
        }
        task.destroy();
        this.scheduledTaskMap.delete(feedConfigId);
        Logger_1.default.info("[CronFeedScheduler->deleteScheduledTask] A task with the id \"" + feedConfigId + "\" is destroyed and removed.");
    };
    return CronFeedScheduler;
}());
exports.default = CronFeedScheduler;
//# sourceMappingURL=CronFeedScheduler.js.map