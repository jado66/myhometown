import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  const { filename, contentType, originalFilename } = await request.json();

  try {
    const client = new S3Client({ region: "us-west-1" });

    const uniqueId = uuidv4();
    const key = `uploads/${uniqueId}-${originalFilename}`;

    const { url, fields } = await createPresignedPost(client, {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Conditions: [
        ["content-length-range", 0, 1073741824], // up to 1GB
        ["starts-with", "$Content-Type", contentType],
      ],
      Fields: {
        acl: "public-read",
        "Content-Type": contentType,
      },
      Expires: 3600, // 1 hour
    });

    return Response.json({ url, fields });
  } catch (error) {
    return Response.json({ error: error.message });
  }
}
