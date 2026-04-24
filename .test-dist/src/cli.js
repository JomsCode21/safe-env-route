#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const legacy_1 = require("./legacy");
process.exitCode = (0, legacy_1.runCli)(process.argv.slice(2));
