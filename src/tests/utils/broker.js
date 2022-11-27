const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
const httpServer = require('http').createServer();
const WebSocket = require('ws');
const PORT = 1883;
const WEBSOCKET_PORT = 8083;

const startBroker = () => {
  server.listen(PORT, function () {
    console.log('server started and listening on port ', PORT);
  });

  process.on('message', ({ testsCompleted }) => {
    process.exit(testsCompleted ? 0 : 1);
  });
};

const startWebsocketBroker = () => {
  const wss = new WebSocket.Server({ server: httpServer });
  wss.on('connection', function connection (ws) {
    const duplex = WebSocket.createWebSocketStream(ws);
    aedes.handle(duplex);
  });

  httpServer.listen(WEBSOCKET_PORT, function () {
    console.log('websocket server listening on port', WEBSOCKET_PORT);
  });
};

startBroker();
startWebsocketBroker();