const { defineEnv, requireEnv, str } = require("../dist");

defineEnv({
  shared: {
    API_URL: str(),
  },
});

const demoEnv = {
  API_URL: "https://example.com",
  API_URl: "https://typo.example.com",
};

console.log("1) strictUnknownKeys OFF (default):");
const relaxed = requireEnv(["shared"], { env: demoEnv });
console.log(relaxed);

console.log("\n2) strictUnknownKeys ON:");
try {
  requireEnv(["shared"], {
    strictUnknownKeys: true,
    env: demoEnv,
  });
} catch (error) {
  console.error(String(error));
}

