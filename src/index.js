#!/usr/bin/env node

'use strict';

function normalizeNameList(names) {
	if (!Array.isArray(names)) {
		return [];
	}

	return names
		.map((name) => String(name).trim())
		.filter(Boolean);
}

function isMissingValue(value, allowEmpty) {
	if (value === undefined || value === null) {
		return true;
	}

	if (allowEmpty) {
		return false;
	}

	return String(value).trim() === '';
}

function checkEnv(requiredNames, options = {}) {
	const names = normalizeNameList(requiredNames);
	const allowEmpty = Boolean(options.allowEmpty);
	const env = options.env || process.env;
	const missing = [];

	for (const name of names) {
		if (isMissingValue(env[name], allowEmpty)) {
			missing.push(name);
		}
	}

	return {
		ok: missing.length === 0,
		missing,
		values: names.reduce((result, name) => {
			result[name] = env[name];
			return result;
		}, {}),
	};
}

function assertEnv(requiredNames, options = {}) {
	const result = checkEnv(requiredNames, options);

	if (result.ok) {
		return result;
	}

	const message = options.message || `Missing required environment variables: ${result.missing.join(', ')}`;
	const error = new Error(message);
	error.missing = result.missing;
	throw error;
}

function runCli(argv) {
	const requiredNames = argv.length > 0 ? argv : [];
	const result = checkEnv(requiredNames);

	if (result.ok) {
		console.log('All required environment variables are set.');
		return 0;
	}

	console.error(`Missing environment variables: ${result.missing.join(', ')}`);
	return 1;
}

if (require.main === module) {
	process.exitCode = runCli(process.argv.slice(2));
}

module.exports = {
	assertEnv,
	checkEnv,
	runCli,
};
