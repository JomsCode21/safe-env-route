const assert = require('assert');
const envChecker = require('../src');

function testCheckEnvSuccess() {
  const result = envChecker.checkEnv(['API_KEY'], {
    env: {
      API_KEY: 'secret-value',
    },
  });

  assert.strictEqual(result.ok, true);
  assert.deepStrictEqual(result.missing, []);
  assert.deepStrictEqual(result.values, {
    API_KEY: 'secret-value',
  });
}

function testCheckEnvFailure() {
  const result = envChecker.checkEnv(['API_KEY', 'DB_URL'], {
    env: {
      API_KEY: 'secret-value',
    },
  });

  assert.strictEqual(result.ok, false);
  assert.deepStrictEqual(result.missing, ['DB_URL']);
}

function testAssertEnvFailure() {
  assert.throws(
    () => envChecker.assertEnv(['TOKEN'], { env: {} }),
    (error) => {
      assert.ok(error instanceof Error);
      assert.strictEqual(error.message, 'Missing required environment variables: TOKEN');
      assert.deepStrictEqual(error.missing, ['TOKEN']);
      return true;
    },
  );
}

function run() {
  testCheckEnvSuccess();
  testCheckEnvFailure();
  testAssertEnvFailure();
  console.log('All env-checker tests passed.');
}

run();
