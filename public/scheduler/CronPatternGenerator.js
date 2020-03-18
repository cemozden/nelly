"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TimeUnit_1 = require("../time/TimeUnit");
function generateCronPattern(duration) {
    var patternFieldArray = ['0', '*', '*', '*', '*', '*'];
    var unitTypeInt = parseInt(duration.unit.toString());
    patternFieldArray[unitTypeInt] = '*/' + duration.value.toString();
    return duration.unit === TimeUnit_1.TimeUnit.SECONDS ? patternFieldArray.join(' ') : patternFieldArray.slice(1, patternFieldArray.length).join(' ');
}
exports.generateCronPattern = generateCronPattern;
//# sourceMappingURL=CronPatternGenerator.js.map