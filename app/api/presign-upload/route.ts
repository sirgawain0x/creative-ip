import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
    }

    const endpoint = process.env.MEGA_S4_ENDPOINT;
    if (!endpoint) {
      return NextResponse.json({ error: 'Storage endpoint not configured' }, { status: 500 });
    }

    const s3Client = new S3Client({
      endpoint,
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

    // Build a permanent public URL since the object ACL is public-read.
    // Presigned GET URLs expired after 2 hours, causing assets to stop rendering.
    const normalizedEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const downloadUrl = `${normalizedEndpoint}/${bucketName}/${safeFilename}`;

    return NextResponse.json({ uploadUrl, downloadUrl });
  } catch (error: any) {
    console.error("Presign S3 Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
