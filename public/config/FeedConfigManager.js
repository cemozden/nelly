"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/** Mandatory feed config parameters to be checked during runtime.
  * @see ConfigUtil
*/
exports.MANDATORY_FEED_CONFIG_PARAMS = ['feedConfigId', 'categoryId', 'name', 'url', 'fetchPeriod', 'enabled'];
/**
 * The root category of Nelly.
 * This category is written to category.json file if no category.json file is existing.
 * @see JSONFeedConfigManager
 */
exports.DEFAULT_ROOT_CATEGORY = {
    categoryId: 'root',
    childCategories: [],
    name: 'Root',
    visible: true
};
/**
 * The function that checks whether a given FeedCategory object exist in a tree.
 *
 * @param categoryIdToSearch The object that will be searched on the feed category tree.
 * @param objToLookFor The feed category tree that will be looked for.
 * @see JSONFeedConfigManager
 */
function feedCategoryExist(categoryIdToSearch, objToLookFor) {
    if (categoryIdToSearch === objToLookFor.categoryId)
        return objToLookFor;
    for (var _i = 0, _a = objToLookFor.childCategories; _i < _a.length; _i++) {
        var cc = _a[_i];
        if (feedCategoryExist(categoryIdToSearch, cc))
            return cc;
    }
    return null;
}
exports.feedCategoryExist = feedCategoryExist;
/**
 * The method that returns a specific feed category from the category tree.
 * If the given category id cannot be found then it returns null.
 * @param categoryId The id of the category that will be searched for.
 * @param nodeToLookFor The node of the tree that category id will be looked inside.
 */
function getCategoryById(categoryId, nodeToLookFor) {
    if (nodeToLookFor.categoryId === categoryId)
        return nodeToLookFor;
    for (var _i = 0, _a = nodeToLookFor.childCategories; _i < _a.length; _i++) {
        var cc = _a[_i];
        var node = getCategoryById(categoryId, cc);
        if (node !== null)
            return node;
    }
    return null;
}
exports.getCategoryById = getCategoryById;
var InvalidFeedConfigIdError = /** @class */ (function (_super) {
    __extends(InvalidFeedConfigIdError, _super);
    function InvalidFeedConfigIdError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InvalidFeedConfigIdError;
}(Error));
exports.InvalidFeedConfigIdError = InvalidFeedConfigIdError;
var NotUniqueFeedConfigIdError = /** @class */ (function (_super) {
    __extends(NotUniqueFeedConfigIdError, _super);
    function NotUniqueFeedConfigIdError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NotUniqueFeedConfigIdError;
}(Error));
exports.NotUniqueFeedConfigIdError = NotUniqueFeedConfigIdError;
var NotExistFeedCategoryError = /** @class */ (function (_super) {
    __extends(NotExistFeedCategoryError, _super);
    function NotExistFeedCategoryError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NotExistFeedCategoryError;
}(Error));
exports.NotExistFeedCategoryError = NotExistFeedCategoryError;
var InvalidFeedCategoryIdError = /** @class */ (function (_super) {
    __extends(InvalidFeedCategoryIdError, _super);
    function InvalidFeedCategoryIdError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InvalidFeedCategoryIdError;
}(Error));
exports.InvalidFeedCategoryIdError = InvalidFeedCategoryIdError;
var InvalidFeedCategoryError = /** @class */ (function (_super) {
    __extends(InvalidFeedCategoryError, _super);
    function InvalidFeedCategoryError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InvalidFeedCategoryError;
}(Error));
exports.InvalidFeedCategoryError = InvalidFeedCategoryError;
var InvalidFeedConfigError = /** @class */ (function (_super) {
    __extends(InvalidFeedConfigError, _super);
    function InvalidFeedConfigError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InvalidFeedConfigError;
}(Error));
exports.InvalidFeedConfigError = InvalidFeedConfigError;
//# sourceMappingURL=FeedConfigManager.js.map