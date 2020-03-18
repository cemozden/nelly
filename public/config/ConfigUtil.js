"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FeedConfigManager_1 = require("./FeedConfigManager");
/**
 * FeedConfig type guard that is used to check that parameter obj is a FeedConfig instance.
 * @param obj The object that is going to be checked.
 */
function isFeedConfig(obj) {
    var objectKeys = Object.keys(obj);
    return FeedConfigManager_1.MANDATORY_FEED_CONFIG_PARAMS
        .filter(function (k) { return !objectKeys.includes(k); }).length === 0;
}
exports.isFeedConfig = isFeedConfig;
/**
 * The function that returns true if the given category id exist in the given feed category tree.

 * @param categoryId The category id that will be searched
 * @param feedCategory The category tree that id will be searched in
 * @see JSONFeedConfigManager
 */
function categoryIdExist(categoryId, feedCategory) {
    if (feedCategory.categoryId === categoryId)
        return true;
    for (var _i = 0, _a = feedCategory.childCategories; _i < _a.length; _i++) {
        var fc = _a[_i];
        if (categoryIdExist(categoryId, fc))
            return true;
    }
    return false;
}
exports.categoryIdExist = categoryIdExist;
/**
 * The function that deletes a given feed category from a feed category tree.
 * @param feedCategoryToDelete The feed category that will be deleted from the tree
 * @param categoryTree The category tree that the given feed category will be looked and deleted.
 * @see JSONFeedConfigManager
 */
function deleteFeedCategoryFromCategoryTree(feedCategoryToDelete, categoryTree) {
    var categoryIndex = categoryTree.childCategories.indexOf(feedCategoryToDelete);
    if (categoryIndex !== -1) {
        categoryTree.childCategories.splice(categoryIndex, 1);
        return true;
    }
    else {
        for (var _i = 0, _a = categoryTree.childCategories; _i < _a.length; _i++) {
            var cc = _a[_i];
            if (deleteFeedCategoryFromCategoryTree(feedCategoryToDelete, cc))
                return true;
        }
    }
    return false;
}
exports.deleteFeedCategoryFromCategoryTree = deleteFeedCategoryFromCategoryTree;
//# sourceMappingURL=ConfigUtil.js.map