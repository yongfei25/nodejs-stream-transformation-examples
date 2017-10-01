const fs = require('fs')
const zlib = require('zlib')
const path = require('path')
const split = require('split2')
const { Transform } = require('stream')

// Declare the paths
const dataLib = require('./data-lib')
const sourcePath = dataLib.getMockDataPath()
const outputPathMale = path.join(dataLib.getOutputDir(), '4-fork-stream-male.gz')
const outputPathFemale = path.join(dataLib.getOutputDir(), '4-fork-stream-female.gz')

// Create the readable stream
const reader = fs.createReadStream(sourcePath)
  .pipe(zlib.createGunzip())
  // This time we parse JSON in split2 package
  .pipe(split(JSON.parse))

// Remember split() returns Transform stream that can also a Readable stream itself.
// Therefore `reader` now is a Readable stream that emits JSON objects as data.

function createFilter (gender) {
  // Create a transform stream according to gender.
  return Transform({
    // Indicate this stream will read data as object.
    writableObjectMode: true,
    transform (object, encoding, callback) {
      if (object.gender && object.gender === gender) {
        return callback(null, JSON.stringify(object) + '\n')
      }
      callback()
    }
  })
}

// Push data to output 1
const output1 = reader
  .pipe(createFilter('Male'))
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream(outputPathMale))

// Also push data to output 2
const output2 = reader
  .pipe(createFilter('Female'))
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream(outputPathFemale))

output1.on('finish', () => console.log('Done writing output 1.'))
output2.on('finish', () => console.log('Done writing output 2.'))
