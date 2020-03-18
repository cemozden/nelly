"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var FeedConfigManager_1 = require("../config/FeedConfigManager");
var crc_1 = require("crc");
var Logger_1 = __importDefault(require("../utils/Logger"));
function ConfigAPI(express, configManager) {
    var _this = this;
    /**
     *
     * Required Parameters
     * categoryName : string
     * parentCategoryId : string
     * visible : boolean
     *  */
    express.get('/addfeedcategory', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var params, categoryName, visible, parentCategoryId, errorMessage, errorMessage, feedConfigManager, feedCategory, categoryAdded, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = req.query;
                    categoryName = params.categoryName;
                    visible = params.visible !== undefined && params.visible === 'true';
                    parentCategoryId = params.parentCategoryId;
                    if (categoryName === undefined || categoryName.length === 0) {
                        errorMessage = 'Category name is not a valid name! Please provide a valid name to add a new feed category.';
                        res.status(400).json({ message: errorMessage });
                        Logger_1.default.error("[AddFeedCategory] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    if (parentCategoryId === undefined || parentCategoryId.length === 0) {
                        errorMessage = 'Parent category id is not a valid id!';
                        res.status(400).json({ message: errorMessage });
                        Logger_1.default.error("[AddFeedCategory] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    feedConfigManager = configManager.getFeedConfigManager();
                    feedCategory = {
                        categoryId: crc_1.crc32(Math.random().toString(36).substring(2, 9)).toString(16),
                        childCategories: [],
                        name: categoryName,
                        visible: visible
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, feedConfigManager.addFeedCategory(feedCategory, parentCategoryId)];
                case 2:
                    categoryAdded = _a.sent();
                    if (categoryAdded)
                        res.json({ added: true, categoryObject: feedCategory, rootCategory: feedConfigManager.getRootCategory() });
                    else
                        res.json({ added: false, errorMessage: 'An error occured while adding the category!' });
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    Logger_1.default.error("[AddFeedCategory] " + err_1.message + ", Request Params: " + JSON.stringify(params));
                    res.status(500).json({ message: err_1.message });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    /**
     *
     * Required Parameters
     * categoryId : string
     * categoryName : string
     * visible : boolean
     *
     */
    express.get('/updatefeedcategory', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var params, categoryId, categoryName, visible, errorMessage, errorMessage, feedConfigManager, updatedFeedCategory, categoryUpdated, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = req.query;
                    categoryId = params.categoryId;
                    categoryName = params.categoryName;
                    visible = params.visible !== undefined && params.visible === 'true';
                    if (categoryName === undefined || categoryName.length === 0) {
                        errorMessage = 'Category name is not a valid name! Please provide a valid name to add a new feed category.';
                        res.status(400).json({ message: errorMessage });
                        Logger_1.default.error("[UpdateFeedCategory] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    if (categoryId === undefined || categoryId.length === 0) {
                        errorMessage = 'Parent category id is not a valid id!';
                        res.status(400).json({ message: errorMessage });
                        Logger_1.default.error("[UpdateFeedCategory] " + errorMessage + ", Request params: " + JSON.stringify(params));
                        return [2 /*return*/];
                    }
                    feedConfigManager = configManager.getFeedConfigManager();
                    updatedFeedCategory = {
                        categoryId: categoryId,
                        name: categoryName,
                        visible: visible,
                        childCategories: FeedConfigManager_1.getCategoryById(categoryId, feedConfigManager.getRootCategory()).childCategories
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, feedConfigManager.updateFeedCategory(updatedFeedCategory, categoryId)];
                case 2:
                    categoryUpdated = _a.sent();
                    if (categoryUpdated)
                        res.json({ added: true, categoryObject: updatedFeedCategory, rootCategory: feedConfigManager.getRootCategory() });
                    else
                        res.json({ added: false, errorMessage: 'An error occured while updating the category!' });
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    Logger_1.default.error("[UpdateFeedCategory] " + err_2.message + ", Request Params: " + JSON.stringify(params));
                    res.status(500).json({ message: err_2.message });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
}
exports.default = ConfigAPI;
//# sourceMappingURL=ConfigAPI.js.map