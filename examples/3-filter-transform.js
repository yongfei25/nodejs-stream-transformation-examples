const fs = require('fs')
const zlib = require('zlib')
const path = require('path')
const split = require('split2')

// Declare the paths
const dataLib = require('./data-lib')
const sourcePath = dataLib.getMockDataPath()
const targetPath = path.join(dataLib.getOutputDir(), '3-filter-transform-result.gz')

// Empty counter
let counter = 0

// Create a Transform stream to produce JSON strings.
const { Transform } = require('stream')
const transform = Transform({
  transform (chunk, encoding, callback) {
    let obj
    // Parse JSON string
    try {
      obj = JSON.parse(chunk)
    } catch (err) {
      // We don't want to stop the transformation here due to a few errornous JSON.
      // instead emit the parsing error for consumers.
      this.emit('json_error', err)
      return callback()
    }
    // Ignore records without email address, emits an event
    if (!obj.email) {
      this.emit('empty_email', obj)
      return callback()
    }
    const data = {
      recipient: obj.email,
      content: `Hello, ${obj.first_name}.`
    }
    return callback(null, JSON.stringify(data) + '\n')
  }
})

transform.on('empty_email', (obj) => {
  // Count and print the records.
  counter += 1
  console.log(`No email address, ignoring: ${JSON.stringify(obj)}`)
})

// Read, gunzip, apply line break.
let stream = fs.createReadStream(sourcePath)
  .pipe(zlib.createGunzip())
  .pipe(split())
  .pipe(transform)
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream(targetPath))

stream.on('error', (err) => {
  console.error(err)
  stream.end()
})
stream.on('finish', () => console.log(`Done writing output file. Records without email ${counter}.`))
