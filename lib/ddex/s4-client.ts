import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';

// Initialize the standard AWS SDK to talk to MEGA S4
export const s4Client = new S3Client({
  endpoint: process.env.MEGA_S4_ENDPOINT || 'https://s3.ca-central-1.s4.mega.io',
  region: process.env.MEGA_S4_REGION || 'ca-central-1',
  credentials: {
    accessKeyId: process.env.MEGA_S4_ACCESS_KEY || '',
    secretAccessKey: process.env.MEGA_S4_SECRET_KEY || '',
  },
  forcePathStyle: true, // Required for MEGA S4 compatibility
});

export async function downloadDDEXDelivery(fileName: string, localPath: string): Promise<void> {
  console.log(`Downloading ${fileName} from MEGA S4...`);
  
  // Ensure directory exists
  const dir = path.dirname(localPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const command = new GetObjectCommand({
    Bucket: process.env.MEGA_S4_BUCKET,
    Key: fileName,
  });

  const response = await s4Client.send(command);
  
  if (!response.Body) {
    throw new Error(`Failed to read response body for ${fileName}`);
  }

  const writeStream = fs.createWriteStream(localPath);
  
  // The response body is a web stream or readable stream depending on the environment
  // In Node.js environment, it's typically a Readable stream.
  const bodyStream = response.Body as any;
  bodyStream.pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}

export async function deleteFromMega(bucket: string | undefined, fileName: string): Promise<void> {
  console.log(`Deleting ${fileName} from MEGA S4 Inbox...`);
  
  if (!bucket) throw new Error("Missing bucket configuration");
  
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: fileName,
  });

  await s4Client.send(command);
  console.log(`✅ Deleted ${fileName}`);
}
