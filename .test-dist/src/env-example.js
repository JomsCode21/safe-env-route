"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEnvExample = generateEnvExample;
exports.writeEnvExample = writeEnvExample;
const node_fs_1 = require("node:fs");
const define_env_1 = require("./define-env");
const defaultOptions = {
    includeComments: true,
    newlineBetweenGroups: true,
    overwrite: true,
};
function getOptions(options) {
    return {
        ...defaultOptions,
        ...(options ?? {}),
    };
}
function generateEnvExample(options) {
    const schema = (0, define_env_1.getDefinedSchema)();
    const settings = getOptions(options);
    const groups = Object.entries(schema);
    const lines = [];
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
        const [groupName, groupSchema] = groups[groupIndex];
        if (settings.includeComments) {
            lines.push(`# [${groupName}]`);
        }
        for (const key of Object.keys(groupSchema)) {
            lines.push(`${key}=`);
        }
        const shouldAddSpacer = settings.newlineBetweenGroups && groupIndex < groups.length - 1;
        if (shouldAddSpacer) {
            lines.push("");
        }
    }
    const content = lines.join("\n");
    if (content === "") {
        return "\n";
    }
    return `${content}\n`;
}
function writeEnvExample(filePath = ".env.example", options) {
    const settings = getOptions(options);
    if (!settings.overwrite && (0, node_fs_1.existsSync)(filePath)) {
        throw new Error(`Refusing to overwrite existing file: ${filePath}`);
    }
    const content = generateEnvExample(settings);
    (0, node_fs_1.writeFileSync)(filePath, content, "utf8");
    return content;
}
