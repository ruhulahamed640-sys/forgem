"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactSensitiveData = redactSensitiveData;
const constants_1 = require("../constants");
function redactSensitiveData(input) {
    if (input === null || input === undefined || typeof input !== 'object') {
        return input;
    }
    if (input instanceof Date) {
        return input;
    }
    if (typeof input.toJSON === 'function') {
        return input;
    }
    if (Array.isArray(input)) {
        return input.map((item) => redactSensitiveData(item));
    }
    const clone = {};
    for (const [key, value] of Object.entries(input)) {
        if (constants_1.SENSITIVE_FIELDS.includes(key)) {
            continue;
        }
        clone[key] = redactSensitiveData(value);
    }
    return clone;
}
//# sourceMappingURL=redaction.util.js.map