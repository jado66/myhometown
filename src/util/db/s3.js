import AWS from 'aws-sdk';

// Check the AWS Credentials
if (!process.env.AWS_ACCESS_KEY) {
    throw new Error('Define the AWS_ACCESS_KEY environmental variable');
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Define the AWS_SECRET_ACCESS_KEY environmental variable');
}
if (!process.env.AWS_REGION) {
    throw new Error('Define the AWS_REGION environmental variable');
}

// Cache the S3 instance
let cachedS3 = null;

export function connectToS3Bucket() {

    // If the cache is present, use it.
    if (cachedS3) {
        return cachedS3;
    }

    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    });

    cachedS3 = new AWS.S3();

    return cachedS3;
}