const fs = require('fs')
const url = require('url')
const zlib = require('zlib')
const split = require('split2')
const aws = require('aws-sdk')
const dataLib = require('./data-lib')
const { Transform } = require('stream')

// Declare the paths
const sourcePath = dataLib.getMockDataPath()
const s3SourcePath = process.env.S3_SOURCE_PATH
const s3TargetPath = process.env.S3_TARGET_PATH
const region = process.env.AWS_REGION || 'ap-southeast-1'
if (!s3SourcePath || !s3TargetPath) {
  console.log('Kindly ensure these env variables are set: S3_SOURCE_PATH, S3_TARGET_PATH')
}

async function start () {
  const s3 = new aws.S3({ region })
  const s3SourceUrl = url.parse(s3SourcePath)
  const s3TargetUrl = url.parse(s3TargetPath)

  // Uploading the file with Readable stream
  await s3.upload({
    Bucket: s3SourceUrl.host,
    Key: s3SourceUrl.pathname.slice(1),
    Body: fs.createReadStream(sourcePath)
  }).promise()

  // Create a transform stream to convert JSON records to CSV format
  const transform = Transform({
    writableObjectMode: true,
    transform (obj, encoding, callback) {
      const csv = `"${obj.first_name}","${obj.last_name}", "${obj.gender}", "${obj.email}"\n`
      return callback(null, csv)
    }
  })

  // Create the transformation stream pipeline
  const stream = s3.getObject({
    Bucket: s3SourceUrl.host,
    Key: s3SourceUrl.pathname.slice(1)
  }).createReadStream()
    .pipe(zlib.createGunzip())
    .pipe(split(JSON.parse))
    .pipe(transform)
    .pipe(zlib.createGzip())

  // Stream to target s3 object.
  await s3.upload({
    Bucket: s3TargetUrl.host,
    Key: s3TargetUrl.pathname.slice(1),
    Body: stream
  }).promise()

  // Stream the uploaded data to standard output
  await new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: s3TargetUrl.host,
      Key: s3TargetUrl.pathname.slice(1)
    }).createReadStream()
      .pipe(zlib.createGunzip())
      .pipe(process.stdout)
      .on('error', reject)
      .on('finish', resolve)
  })
}

start().then(() => console.log('Done')).catch(err => { console.error(err) })
