const assert = require('assert').strict;
const http = require('http');
const app = require('../app');

function request(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.get(
      { hostname: '127.0.0.1', port, path },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('error', reject);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );
    req.setTimeout(5000, () => {
      req.destroy(new Error('Request timed out'));
    });
    req.on('error', reject);
  });
}

async function main() {
  // Use an available temporary port instead of Jenkins' port 8080.
  const server = app.listen(0, '127.0.0.1');

  try {
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });

    const port = server.address().port;
    const home = await request(port, '/');

    assert.equal(home.status, 200);
    console.log('PASS: Homepage returns HTTP 200');

    assert.equal(home.body, 'Hello World!');
    console.log('PASS: Homepage returns the expected greeting');

    const missing = await request(port, '/route-that-does-not-exist');
    assert.equal(missing.status, 404);
    console.log('PASS: Unknown route returns HTTP 404');

    console.log('All 3 checks passed.');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

main().catch((error) => {
  console.error('FAIL:', error);
  process.exitCode = 1;
});
