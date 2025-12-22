const chrome = require("selenium-webdriver/chrome")
const fs = require("fs")
const path = require("path")

const OriginalServiceBuilder = chrome.ServiceBuilder

chrome.ServiceBuilder = function (driverPath) {
  const instance = new OriginalServiceBuilder(driverPath)

  console.log("---------------------------------------------------------")
  console.log("SUCCESS: Captured ServiceBuilder via NODE_OPTIONS!")
  console.log("---------------------------------------------------------")

  instance.enableVerboseLogging()
  instance.loggingTo("logs/chromedriver.log")
  return instance
}

chrome.ServiceBuilder.prototype = OriginalServiceBuilder.prototype
