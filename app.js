const express = require('express');
const home = require('./home');
const app = express();
const port = 8080;

app.get('/', home);

// Start the server only when executed directly.
if (require.main === module) {
  app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
  });
}

module.exports = app;
