import * as path from "path"
import { TEST_PROJECT_FOLDER } from "./utils/constants.js"

import { rimraf } from "rimraf"

const removeTestFolders = async () => {
  console.log("Removing project folders")
  await rimraf(path.join(__dirname, TEST_PROJECT_FOLDER + "*"), {
    glob: true,
  })
}

after(async function () {
  await removeTestFolders()
})
