// Homepage request handler, shared by the application and unit test.
function home(req, res) {
  return res.send('Hello World!');
}

module.exports = home;
