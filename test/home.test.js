const assert = require('assert').strict;
const home = require('../home');

// Substitute the response object so no HTTP server is needed.
const sentBodies = [];
const response = {
  send(body) {
    sentBodies.push(body);
    return this;
  }
};

home({}, response);

assert.deepEqual(sentBodies, ['Hello World!']);
console.log('PASS: Homepage handler sends the expected greeting exactly once');
