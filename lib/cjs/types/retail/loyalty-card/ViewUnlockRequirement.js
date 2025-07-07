"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewUnlockRequirementEnum = void 0;
var ViewUnlockRequirementEnum;
(function (ViewUnlockRequirementEnum) {
    ViewUnlockRequirementEnum["VIEW_UNLOCK_REQUIREMENT_UNSPECIFIED"] = "VIEW_UNLOCK_REQUIREMENT_UNSPECIFIED";
    ViewUnlockRequirementEnum["UNLOCK_NOT_REQUIRED"] = "UNLOCK_NOT_REQUIRED";
    /**
     * If the user removes their device lock after saving the pass, then they will be prompted to create a device lock before the pass can be viewed.
     */
    ViewUnlockRequirementEnum["UNLOCK_REQUIRED_TO_VIEW"] = "UNLOCK_REQUIRED_TO_VIEW";
})(ViewUnlockRequirementEnum || (exports.ViewUnlockRequirementEnum = ViewUnlockRequirementEnum = {}));
//# sourceMappingURL=ViewUnlockRequirement.js.map