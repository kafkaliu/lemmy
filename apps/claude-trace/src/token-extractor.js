// Token extractor for OAuth token extraction
const fs = require("fs");
const path = require("path");
const originalFetch = global.fetch;

// Get token file from environment variable
const TEMP_TOKEN_FILE = process.env.CLAUDE_TRACE_TOKEN_FILE;

// Get Anthropic base URL from environment variable, fallback to default
const ANTHROPIC_BASE_URL = process.env.ANTHROPIC_BASE_URL || "api.anthropic.com";

global.fetch = async function (input, init = {}) {
	const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

	if (url.includes(ANTHROPIC_BASE_URL) && url.includes("/v1/messages")) {
		const headers = new Headers(init.headers || {});
		const authorization = headers.get("authorization");
		if (authorization && authorization.startsWith("Bearer ") && TEMP_TOKEN_FILE) {
			const token = authorization.substring(7);
			try {
				fs.writeFileSync(TEMP_TOKEN_FILE, token);
			} catch (e) {
				// Ignore write errors silently
			}
		}
	}

	return originalFetch(input, init);
};
