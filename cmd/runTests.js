const { spawn } = require("child_process")
const path = require("path")
const fs = require("fs")

async function runTests() {
  console.log("Starting Test Runner...")
  const cwd = process.cwd()

  const logsDir = path.join(cwd, "logs")
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir)
  }

  const logFile = path.join(cwd, "logs/test-output.log")
  console.log(`Logging output to: ${logFile}`)

  return new Promise((_, __) => {
    const patchPath = path.resolve(__dirname, "patchDriver.js")

    const cmd = "npx extest setup-and-run out/tests/*.js -m src/tests/.mocharc.js --storage test-resources"

    const child = spawn(cmd, {
      shell: true,
      stdio: ["inherit", "pipe", "pipe"],
      env: {
        ...process.env,
        NODE_OPTIONS: `--require ${patchPath}`,
      },
    })

    child.stdout.on("data", (data) => {
      const output = data.toString()
      console.log(output)
      fs.appendFileSync(logFile, output)
    })

    child.stderr.on("data", (data) => {
      const output = data.toString()
      console.error(output)
      fs.appendFileSync(logFile, output)
    })

    child.on("close", (code) => {
      if (code === 0) {
        console.log("Runner: Tests passed.")
        process.exit(0)
      } else {
        console.error(`Runner: Tests failed with code ${code}`)
        process.exit(code) // Ensure GitHub Actions sees the failure
      }
    })

    child.on("error", (err) => {
      console.error("Runner: Critical error:", err)
      process.exit(1)
    })
  })
}

runTests()
