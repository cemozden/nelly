"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var RSSParser_1 = require("./RSSParser");
var RSS20Validator_1 = __importDefault(require("./validators/RSS20Validator"));
var RSSVersion_1 = require("../specifications/RSSVersion");
var RSS20Parser_1 = __importDefault(require("./RSS20Parser"));
var Logger_1 = __importDefault(require("../../utils/Logger"));
var RSSParserFactory = /** @class */ (function () {
    function RSSParserFactory() {
    }
    RSSParserFactory.isRSSParser = function (parser) {
        return parser !== undefined;
    };
    RSSParserFactory.generateRSSParser = function (rssObject) {
        for (var _i = 0, _a = this.rssValidators; _i < _a.length; _i++) {
            var validator = _a[_i];
            try {
                var rssVersion = validator.validate(rssObject);
                var rssParser = this.parsers.get(rssVersion);
                if (this.isRSSParser(rssParser))
                    return rssParser;
            }
            catch (err) {
                Logger_1.default.error("[" + this.LOG_LABEL + "] " + err.message);
            }
        }
        throw new RSSParser_1.RSSParserError('Given RSS source is not a RSS specification defined in Nelly.');
    };
    RSSParserFactory.LOG_LABEL = 'RSSParserFactory';
    RSSParserFactory.rssValidators = [
        new RSS20Validator_1.default()
    ];
    RSSParserFactory.parsers = new Map([
        [RSSVersion_1.RSSVersion.RSS_20, new RSS20Parser_1.default()]
    ]);
    return RSSParserFactory;
}());
exports.default = RSSParserFactory;
//# sourceMappingURL=RSSParserFactory.js.map