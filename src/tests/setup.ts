import path = require("path")
import { TEST_PROJECT_FOLDER } from "./utils/constants"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rimraf = require("rimraf")

const removeTestFolders = async () => {
  console.log("Removing project folders")
  await rimraf(
    path.join(__dirname, TEST_PROJECT_FOLDER + "*"),
    function (error: Error) {
      if (error) {
        console.log("Could not remove test project folder")
        console.log(error)
      }
    }
  )
}

after(async function () {
  await removeTestFolders()
})
