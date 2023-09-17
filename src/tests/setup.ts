import path = require("path")
import { TEST_PROJECT_FOLDER } from "./utils/constants"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { rimraf } = require("rimraf")

const removeTestFolders = async () => {
  console.log("Removing project folders")
  await rimraf(path.join(__dirname, TEST_PROJECT_FOLDER + "*"), {
    glob: true,
  })
}

after(async function () {
  await removeTestFolders()
})
