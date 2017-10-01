const path = require('path')

function getMockDataPath () {
  return path.join(getDataDir(), '../data/mock-data.gz')
}

function getDataDir () {
  return path.join(__dirname, '../data')
}

function getOutputDir () {
  return path.join(__dirname, '../outputs')
}

module.exports = {
  getMockDataPath,
  getDataDir,
  getOutputDir
}
