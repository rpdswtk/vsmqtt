/* eslint-disable @typescript-eslint/no-var-requires */
const aedes = require("aedes")()
const server = require("net").createServer(aedes.handle)
const PORT = 1883

const startBroker = () => {
  server.listen(PORT, function () {
    console.log("server started and listening on port ", PORT)
  })

  process.on("message", ({ testsCompleted }) => {
    process.exit(testsCompleted ? 0 : 1)
  })
}

startBroker()
