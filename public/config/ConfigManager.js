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
/**
 * The class which is thrown in case the configuration path of the application is not a valid string.
 * @see JSONConfigManager
 */
var ConfigPathNotAvailableError = /** @class */ (function (_super) {
    __extends(ConfigPathNotAvailableError, _super);
    function ConfigPathNotAvailableError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ConfigPathNotAvailableError;
}(Error));
exports.ConfigPathNotAvailableError = ConfigPathNotAvailableError;
//# sourceMappingURL=ConfigManager.js.map