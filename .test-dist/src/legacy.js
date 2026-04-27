"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEnv = checkEnv;
exports.assertEnv = assertEnv;
exports.runCli = runCli;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const env_example_1 = require("./env-example");
const defaultSchemaCandidates = [
    "dist/env/schema.js",
    "dist/schema.js",
    "env/schema.js",
    "schema.js",
];
function normalizeNameList(names) {
    if (!Array.isArray(names)) {
        return [];
    }
    return names.map((name) => String(name).trim()).filter(Boolean);
}
function isMissingValue(value, allowEmpty) {
    if (value === undefined || value === null) {
        return true;
    }
    if (allowEmpty) {
        return false;
    }
    return value.trim() === "";
}
function checkEnv(requiredNames, options = {}) {
    const names = normalizeNameList(requiredNames);
    const allowEmpty = Boolean(options.allowEmpty);
    const env = options.env ?? process.env;
    const missing = [];
    for (const name of names) {
        if (isMissingValue(env[name], allowEmpty)) {
            missing.push(name);
        }
    }
    const values = names.reduce((result, name) => {
        result[name] = env[name];
        return result;
    }, {});
    return {
        ok: missing.length === 0,
        missing,
        values,
    };
}
function assertEnv(requiredNames, options = {}) {
    const result = checkEnv(requiredNames, options);
    if (result.ok) {
        return result;
    }
    const message = options.message ?? `Missing required environment variables: ${result.missing.join(", ")}`;
    const error = new Error(message);
    error.missing = result.missing;
    throw error;
}
function parseCliOptions(argv) {
    let generateExample = false;
    let schemaPath;
    let outputPath = ".env.example";
    let overwrite = true;
    const requiredNames = [];
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === "--generate-example") {
            generateExample = true;
            continue;
        }
        if (arg === "--schema") {
            const nextArg = argv[index + 1];
            if (!nextArg || nextArg.startsWith("-")) {
                throw new Error("Missing value for --schema");
            }
            schemaPath = nextArg;
            index += 1;
            continue;
        }
        if (arg === "--out") {
            const nextArg = argv[index + 1];
            if (!nextArg || nextArg.startsWith("-")) {
                throw new Error("Missing value for --out");
            }
            outputPath = nextArg;
            index += 1;
            continue;
        }
        if (arg === "--no-overwrite") {
            overwrite = false;
            continue;
        }
        if (arg.startsWith("--")) {
            throw new Error(`Unknown option: ${arg}`);
        }
        requiredNames.push(arg);
    }
    return {
        generateExample,
        schemaPath,
        outputPath,
        overwrite,
        requiredNames,
    };
}
function loadSchemaModule(schemaPath) {
    if (schemaPath) {
        const resolvedSchemaPath = (0, node_path_1.resolve)(process.cwd(), schemaPath);
        require(resolvedSchemaPath);
        return resolvedSchemaPath;
    }
    for (const candidate of defaultSchemaCandidates) {
        const resolvedCandidate = (0, node_path_1.resolve)(process.cwd(), candidate);
        if (!(0, node_fs_1.existsSync)(resolvedCandidate)) {
            continue;
        }
        require(resolvedCandidate);
        return resolvedCandidate;
    }
    return undefined;
}
function runCli(argv) {
    try {
        const options = parseCliOptions(argv);
        if (options.generateExample) {
            const loadedSchemaPath = loadSchemaModule(options.schemaPath);
            try {
                (0, env_example_1.writeEnvExample)(options.outputPath, { overwrite: options.overwrite });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (!options.schemaPath &&
                    message.includes("No environment schema defined. Call defineEnv({...})")) {
                    throw new Error(`No schema was loaded. Either pass --schema <path> or place schema at one of: ${defaultSchemaCandidates.join(", ")}`);
                }
                throw error;
            }
            console.log(`Generated ${options.outputPath}`);
            if (loadedSchemaPath) {
                console.log(`Using schema ${loadedSchemaPath}`);
            }
            return 0;
        }
        const result = checkEnv(options.requiredNames);
        if (result.ok) {
            console.log("All required environment variables are set.");
            return 0;
        }
        console.error(`Missing environment variables: ${result.missing.join(", ")}`);
        return 1;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(message);
        return 1;
    }
}
