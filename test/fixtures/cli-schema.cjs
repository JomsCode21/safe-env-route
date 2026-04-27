const { defineEnv, str, int } = require("../../.test-dist/src/index.js");

defineEnv({
  shared: {
    APP_URL: str(),
    PORT: int(),
  },
  auth: {
    GOOGLE_CLIENT_ID: str(),
  },
});
