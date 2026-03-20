import { Aedes } from "aedes"
import { createServer as createHttpServer } from "node:http"
import { createServer } from "node:net"
import { WebSocketServer, createWebSocketStream } from "ws"
const PORT = 1883
const WEBSOCKET_PORT = 8083

const startBroker = async () => {
  const aedes = await Aedes.createBroker()
  const server = createServer(aedes.handle)

  server.listen(PORT, function () {
    console.log("server started and listening on port ", PORT)
  })

  server.on("connection", function (stream) {
    const client = stream.client
    console.log("client connected", client ? client.id : "unknown")
  })
}

const startWebsocketBroker = async () => {
  const aedes = await Aedes.createBroker()
  const httpServer = createHttpServer()
  const wss = new WebSocketServer({
    server: httpServer,
  })

  wss.on("connection", (websocket, req) => {
    console.log("websocket client connected")
    const stream = createWebSocketStream(websocket)
    aedes.handle(stream, req)
  })

  httpServer.listen(WEBSOCKET_PORT, function () {
    console.log("websocket server listening on port ", WEBSOCKET_PORT)
  })
}

startBroker()
startWebsocketBroker()
