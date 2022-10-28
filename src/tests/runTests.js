import spawn from "cross-spawn"
import { fork } from "child_process"

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

tests.on("error", (code) => {
  gracefullyCloseBroker(false)
})

const gracefullyCloseBroker = (testsCompleted) => {
  broker.send({ testsCompleted })
}

broker.on("close", (code) => {
  // eslint-disable-next-line no-undef
  process.exit(code)
})
