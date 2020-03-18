"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var FeedCategoryAPIs_1 = __importDefault(require("./FeedCategoryAPIs"));
var FeedAPIs_1 = __importDefault(require("./FeedAPIs"));
function initAPIs(express, configManager, feedScheduler) {
    FeedCategoryAPIs_1.default(express, configManager);
    FeedAPIs_1.default(express, configManager, feedScheduler);
}
exports.default = initAPIs;
//# sourceMappingURL=APIs.js.map