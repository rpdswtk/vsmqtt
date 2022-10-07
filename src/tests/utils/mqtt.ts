const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
const PORT = 1883;

export const startBroker = () => {
  server.listen(PORT, function () {
    console.log('server started and listening on port ', PORT);
  });
};


export const stopBroker = () => {
  aedes.close();
  server.unref();
};