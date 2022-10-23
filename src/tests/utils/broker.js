const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
const PORT = 1883;

const startBroker = () => {
  server.listen(PORT, function () {
    console.log('server started and listening on port ', PORT);
  });

  process.on('message', ({ code }) => {
    process.exit(code);
  });
};
startBroker();