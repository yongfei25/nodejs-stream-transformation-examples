const fs = require('fs')
const zlib = require('zlib')

// Declare the paths
const dataLib = require('./data-lib')
const sourceFile = dataLib.getMockDataPath()

// Create a readable stream
const reader = fs.createReadStream(sourceFile)

// Pipe data to a transform stream created with `split2` package.
const split = require('split2')
const stream = reader
  .pipe(zlib.createGunzip())
  .pipe(split())

// The .pipe() method returns a reference to the destination stream
// making it possible to set up chains of piped streams.
// So `stream` is referencing to the stream returned by split() function.
stream.on('data', (line) => console.log(`${line.toString('utf-8')}\n<---`))
stream.on('end', () => console.log('Done.'))
