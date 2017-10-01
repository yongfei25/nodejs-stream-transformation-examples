const fs = require('fs')
const zlib = require('zlib')
const path = require('path')
const dataLib = require('./data-lib')

// Declare the paths
const sourcePath = dataLib.getMockDataPath()
const targetPath = path.join(dataLib.getOutputDir(), '1-copy-unzip-result')

// Create a Readable stream
const read = fs.createReadStream(sourcePath)
read.on('finish', () => console.log('No more data'))

// zlib.createGunzip() returns a Transform stream that gunzip the data it receives
const transform = zlib.createGunzip()

// Stream is a type of EventEmitter.
// Attach an event listener to print the data it returns.
transform.on('data', (data) => console.log(data.toString('utf-8')))

// Create a Writable Stream
const write = fs.createWriteStream(targetPath)
write.on('error', () => write.end())
write.on('finish', () => console.log('Done writing to file.'))

// Ends the Writable stream on error
read.on('error', () => write.end())

// Start pushing the data
read.pipe(transform).pipe(write)