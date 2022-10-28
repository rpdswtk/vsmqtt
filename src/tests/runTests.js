/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line no-undef
const spawn = require("cross-spawn")
// eslint-disable-next-line no-undef
const fork = require("child_process").fork

const broker = fork("out/tests/utils/broker.js")
const tests = spawn(
  `npm run test-compile && npx extest setup-and-run out/tests/*.js -m .mocharc.js`,
  [],
  { stdio: "inherit" }
)

tests.on("close", (code) => {
  if (code === 0) {
    gracefullyCloseBroker(true)
  }
})

tests.on("error", (_code) => {
  gracefullyCloseBroker(false)
})

const gracefullyCloseBroker = (testsCompleted) => {
  broker.send({ testsCompleted })
}

broker.on("close", (code) => {
  // eslint-disable-next-line no-undef
  process.exit(code)
})
