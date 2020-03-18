"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TimeUnit_1 = require("./TimeUnit");
function isDuration(obj) {
    if (obj.value === undefined || isNaN(obj.value))
        return false;
    if (obj.unit === undefined || isNaN(obj.unit) || obj.unit > TimeUnit_1.LAST_TIME_UNIT_ELEMENT_INDEX)
        return false;
    return true;
}
exports.isDuration = isDuration;
//# sourceMappingURL=Duration.js.map