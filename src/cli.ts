#!/usr/bin/env node

import { runCli } from "./legacy";

process.exitCode = runCli(process.argv.slice(2));
