import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
    }

    const s3Client = new S3Client({
      endpoint: process.env.MEGA_S4_ENDPOINT,
      region: process.env.MEGA_S4_REGION || "ca-central-1",
      credentials: {
        accessKeyId: process.env.MEGA_S4_ACCESS_KEY!,
        secretAccessKey: process.env.MEGA_S4_SECRET_KEY!
      },
      forcePathStyle: true
    });

    const bucketName = process.env.MEGA_S4_BUCKET || "creative-tv-ddex-inbox";
    const safeFilename = `ip-assets/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Generate PUT URL for browser to upload the file directly to Mega S4 securely
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: safeFilename,
      ContentType: contentType,
      ACL: "public-read"
    });
    const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 });

    // Generate GET URL for Crossmint to securely index the file after upload (2-hour limit)
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: safeFilename
    });
    const downloadUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 7200 });

    return NextResponse.json({ uploadUrl, downloadUrl });
  } catch (error: any) {
    console.error("Presign S3 Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
