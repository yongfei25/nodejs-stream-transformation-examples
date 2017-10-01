# Node.js Stream Transformation Examples

This repository contains examples for data transformation in Node.js stream.
You can find the list of examples in table of contents below.

More about stream API in Node.js, kindly see:
https://nodejs.org/api/stream.html#stream_api_for_stream_consumers

## Table of Contents
1. [Copy & gunzip file.](examples/1-copy-unzip.js)
2. [Read & break data into lines.](examples/2-line-break.js)
3. [Filter and transform data.](examples/3-filter-transform.js)
4. [Using stream to transform data from/to S3 object.](examples/4-aws-s3-stream.js)
5. [Fork to multiple output destination.](examples/5-fork-stream.js)

## Helpful Packages
- [split2](https://www.npmjs.com/package/split2) - Break up a stream and reassemble it so that each line is a chunk. 
- [through2](https://www.npmjs.com/package/through2) - A tiny wrapper around Node streams.
