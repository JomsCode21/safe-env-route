"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.str = str;
exports.url = url;
exports.bool = bool;
exports.int = int;
exports.enumOf = enumOf;
function createValidator(kind, description, parse) {
    return { kind, description, parse };
}
function str() {
    return createValidator("str", "a string", (raw) => raw);
}
function url() {
    return createValidator("url", "a valid URL", (raw) => {
        new URL(raw);
        return raw;
    });
}
const trueValues = new Set(["true", "1", "yes", "on"]);
const falseValues = new Set(["false", "0", "no", "off"]);
function bool() {
    return createValidator("bool", "a boolean (true/false)", (raw) => {
        const normalized = raw.trim().toLowerCase();
        if (trueValues.has(normalized)) {
            return true;
        }
        if (falseValues.has(normalized)) {
            return false;
        }
        throw new Error("Expected true, false, 1, 0, yes, no, on, or off");
    });
}
function int() {
    return createValidator("int", "an integer", (raw) => {
        if (!/^-?\d+$/.test(raw.trim())) {
            throw new Error("Expected a whole number");
        }
        return Number.parseInt(raw, 10);
    });
}
function enumOf(values) {
    if (values.length === 0) {
        throw new Error("enumOf(values) requires at least one value");
    }
    const allowed = new Set(values);
    return createValidator("enum", `one of: ${values.join(", ")}`, (raw) => {
        if (!allowed.has(raw)) {
            throw new Error(`Expected one of: ${values.join(", ")}`);
        }
        return raw;
    });
}
