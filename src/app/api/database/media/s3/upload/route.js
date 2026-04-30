import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// Server-side S3 upload. We can't POST to S3 directly from the browser
// because the bucket has no CORS configuration — the browser blocks the
// presigned POST with the same error pattern as our image GETs. Routing
// through this endpoint keeps the upload server-to-server.

const client = new S3Client({
  region: "us-west-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const bucket = process.env.AWS_BUCKET_NAME || "myhometown-bucket";

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return Response.json(
        {
          error:
            "S3 credentials not configured. Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY in .env.local — restart the dev server after adding them.",
        },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const contentType = file.type;
    const originalFilename = file.name;

    if (
      !contentType.startsWith("video/") &&
      !contentType.startsWith("image/") &&
      contentType !== "application/pdf" &&
      contentType !== "image/webp"
    ) {
      return Response.json({ error: "Invalid file type" }, { status: 400 });
    }

    const uniqueId = uuidv4();
    const key = `uploads/${uniqueId}-${originalFilename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    const url = `https://${bucket}.s3.us-west-1.amazonaws.com/${key}`;

    return Response.json({ url });
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return Response.json(
      { error: error?.message || "Unknown S3 upload error" },
      { status: 500 },
    );
  }
}
