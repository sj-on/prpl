# @prpl/plugin-aws

A plugin for [PRPL](https://github.com/tyhopp/prpl) for working with [AWS S3](https://aws.amazon.com/s3/). Useful if 
you would rather have your content files stored in S3 instead of checked in under version control.

## Functions

| Name | Description |
| --- | --- |
| [fetchFromS3](src/fetch-from-s3.ts) | Fetch file(s) from an S3 bucket and write to the local file system |
| [uploadToS3](src/upload-to-s3.ts) | Upload file(s) to an S3 bucket from the local file system |

Click the function names above to see the TypeScript interfaces.

## Requirements
For this plugin to work, you must have:

- [An active AWS account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/)
- [An S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html)
- [Generated access keys](https://aws.amazon.com/premiumsupport/knowledge-center/create-access-key/)

## Usage
Like all plugins, this plugin must be used via the Node interface. Both ECMAScript and CommonJS modules are 
supported.

Security recommendations:
- Do not hardcode secrets passed into this plugin's exports
- Do not check in any file (e.g., `.env`) containing secrets under version control

### Fetch from S3
Example implementation using CommonJS modules.

You can optionally define which directory to work with, but at present 
PRPL core assumes your content is in a `content` directory at the root of your project. This is one area for improvement.

```javascript
const dotenv = require('dotenv');
const { fetchFromS3 } = require('@prpl/plugin-aws');
const { interpolate } = require('@prpl/core');

// Load environment variables from .env
dotenv.config();

// Destructure environment variables
const {
  AWS_ACCESS_KEY: AWSAccessKey,
  AWS_SECRET_ACCESS_KEY: AWSSecretAccessKey,
  AWS_CONTENT_BUCKET: AWSContentBucket,
  AWS_CONTENT_BUCKET_REGION: AWSContentBucketRegion
} = process.env;

// Define our arguments
const keys = {
  AWSAccessKey,
  AWSSecretAccessKey,
  AWSContentBucket,
  AWSContentBucketRegion
};

// Relative to project root, will use Node's path.resolve under the hood
const targetDir = 'content'

// Define an async function because top level await is only available in ECMAScript modules
async function build() {
  
  // Fetch content from S3 and write it to the local file system
  await fetchFromS3(keys, targetDir);

  // Interpolate with PRPL core
  await interpolate();
}

build();
```

### Upload to S3
Example implementation using CommonJS modules.

This function accepts an array of files, so you can upload one or many files as needed for your use case.

```javascript
const dotenv = require('dotenv');
const { uploadToS3 } = require('@prpl/plugin-aws');
const { generateOrRetrieveFileSystemTree } = require('@prpl/core');
const { resolve } = require('path');

// Load environment variables from .env
dotenv.config();

// Destructure environment variables
const {
  AWS_ACCESS_KEY: AWSAccessKey,
  AWS_SECRET_ACCESS_KEY: AWSSecretAccessKey,
  AWS_CONTENT_BUCKET: AWSContentBucket,
  AWS_CONTENT_BUCKET_REGION: AWSContentBucketRegion
} = process.env;

// Define our arguments
const keys = {
  AWSAccessKey,
  AWSSecretAccessKey,
  AWSContentBucket,
  AWSContentBucketRegion
};

// Not required, but we will use this PRPL core lib function to take advantage of cached content files
const { children: files = [] } = generateOrRetrieveFileSystemTree({
  partitionKey: PRPLCachePartitionKey.content,
  entityPath: resolve('content'),
  readFileRegExp: new RegExp(`${PRPLContentFileExtension.html}|${PRPLContentFileExtension.markdown}`)
})

// Define an async function because top level await is only available in ECMAScript modules
async function upload() {

  // Upload files from local `content` directory to S3 bucket
  await uploadToS3(keys, files);
}

upload();
```