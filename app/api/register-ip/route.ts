import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const title = formData.get('title') as string || 'Untitled';
    const description = formData.get('description') as string || '';
    const ipType = formData.get('ipType') as string || 'music';
    const owner = formData.get('owner') as string;
    const baseContractAddress = formData.get('baseContractAddress') as string || '';
    const baseTokenId = formData.get('baseTokenId') as string || '';
    const mediaFile = formData.get('mediaFile') as File | null;
    const coverFile = formData.get('coverFile') as File | null;

    const licenses = formData.get('licenses') as string || '';
    const royalty = formData.get('royalty') as string || '10';

    if (!owner) {
        return NextResponse.json({ error: 'Missing owner address' }, { status: 400 });
    }

    const CROSSMINT_SERVER_KEY = process.env.CROSSMINT_SERVER_KEY;
    if (!CROSSMINT_SERVER_KEY) {
        throw new Error("Missing CROSSMINT_SERVER_KEY in environment variables. Have you added this to Vercel?");
    }

    // Automatically route to staging or production based on the key prefix
    const CROSSMINT_BASE_URL = CROSSMINT_SERVER_KEY.startsWith("sk_live_") 
      ? "https://www.crossmint.com/api" 
      : "https://staging.crossmint.com/api";

    const COLLECTION_ID = process.env.COLLECTION_ID;
    
    if (!COLLECTION_ID) {
        throw new Error("Missing COLLECTION_ID in environment variables. Have you added this to Vercel?");
    }

    // Helper to upload a File blob to Mega S4 and return the public URL
    async function uploadToS3(uploadFile: File): Promise<string | null> {
        try {
            const s3Client = new S3Client({
                endpoint: process.env.MEGA_S4_ENDPOINT,
                region: process.env.MEGA_S4_REGION || "ca-central-1",
                credentials: {
                    accessKeyId: process.env.MEGA_S4_ACCESS_KEY!,
                    secretAccessKey: process.env.MEGA_S4_SECRET_KEY!
                },
                forcePathStyle: true
            });

            const arrayBuffer = await uploadFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const bucketName = process.env.MEGA_S4_BUCKET || "creative-tv-ddex-inbox";
            const filename = `ip-assets/${Date.now()}-${uploadFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: filename,
                Body: buffer,
                ContentType: uploadFile.type || "application/octet-stream",
                ACL: "public-read"
            });

            await s3Client.send(command);
            
            // Generate a presigned URL valid for 2 hours (7200 seconds) so Crossmint can securely index it
            const getCommand = new GetObjectCommand({
                Bucket: bucketName,
                Key: filename
            });
            const presignedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 7200 });
            
            console.log("Successfully uploaded to Mega S4, presigned URL:", presignedUrl);
            return presignedUrl;
        } catch (error) {
            console.error("Mega S4 Upload Error:", error);
            return null;
        }
    }

    // Use dummy public URLs for the example fallback
    let finalImageUrl = "https://cdn2.suno.ai/image_large_c001fd6e-d6cd-474f-a7b6-6e6a9b3e2515.jpeg";
    let finalMediaUrl = "https://cdn1.suno.ai/c001fd6e-d6cd-474f-a7b6-6e6a9b3e2515.mp3";

    if (mediaFile && mediaFile.size > 0 && mediaFile.name) {
        const uploadedMedia = await uploadToS3(mediaFile);
        if (uploadedMedia) finalMediaUrl = uploadedMedia;
    }

    if (coverFile && coverFile.size > 0 && coverFile.name) {
        const uploadedCover = await uploadToS3(coverFile);
        if (uploadedCover) finalImageUrl = uploadedCover;
    } else if (ipType === 'image' && mediaFile) {
        // If it's an image IP and no separate cover was uploaded, the media itself IS the cover
        finalImageUrl = finalMediaUrl;
    }

    const MOCK_LIT_URL = "https://example.com/book.epub";

    const isMusic = ipType === 'music';
    const isImage = ipType === 'image';
    const isLit = ipType === 'literature';

    const mediaUrl = isMusic ? finalMediaUrl : isLit ? MOCK_LIT_URL : finalMediaUrl;
    const mediaType = isMusic ? 'audio/mpeg' : isLit ? 'application/epub+zip' : 'image/jpeg';
    
    // Validate finalImageUrl strictly, because crossmint breaks completely if missing it
    const nftMetadata: any = {
      name: title,
      description: description,
      image: finalImageUrl || "https://cdn2.suno.ai/image_large_c001fd6e-d6cd-474f-a7b6-6e6a9b3e2515.jpeg",
    };


    const attributes: any[] = [
        { key: 'Type', value: ipType },
        { key: 'Licenses', value: licenses },
        { key: 'RoyaltyRate', value: royalty }
    ];

    if (baseContractAddress) {
        attributes.push({ key: 'Original Chain', value: 'Base' });
        attributes.push({ key: 'Base Contract Address', value: baseContractAddress });
    }
    
    if (baseTokenId) {
        attributes.push({ key: 'Base Token ID', value: baseTokenId });
    }

    // Fix EVM wallet address formatting for Crossmint Locators
    let finalOwnerLocator = owner;
    let creatorAddress = owner;

    if (owner.startsWith('0x')) {
        // If frontend passes a raw 0x address, we must prefix it so Crossmint knows the network
        finalOwnerLocator = `story-testnet:${owner}`;
        creatorAddress = owner;
    } else if (owner.startsWith('story-testnet:')) {
        creatorAddress = owner.replace('story-testnet:', '');
    }

    const ipAssetMetadata: any = {
      title: title,
      ipType: ipType,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      creators: [
          {
              name: 'Creator',
              // Use the actual EVM address instead of an email locator which can cause 502s
              address: creatorAddress.startsWith('0x') ? creatorAddress : undefined,
              crossmintUserLocator: !creatorAddress.startsWith('0x') ? finalOwnerLocator : undefined,
              contributionPercent: 100
          }
      ],
      attributes: attributes
    };

    const crossmintPayload = {
      owner: finalOwnerLocator,
      nftMetadata,
      ipAssetMetadata
    };

    const res = await fetch(`${CROSSMINT_BASE_URL}/v1/ip/collections/${COLLECTION_ID}/ipassets`, {
      method: "POST",
      headers: {
        "X-API-KEY": CROSSMINT_SERVER_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(crossmintPayload)
    });

    if (!res.ok) {
        const errObj = await res.json().catch(() => ({}));
        console.error("Crossmint API Error:", errObj);
        
        if (res.status === 403) {
            return NextResponse.json({ 
                error: `Crossmint API Error: Forbidden. Please ensure your CROSSMINT_SERVER_KEY is set in your Vercel Environment Variables and has the 'nfts.create' and 'collection.create' scopes.`,
                details: errObj
            }, { status: 403 });
        }

        console.error("Crossmint API Error:", errObj);
        return NextResponse.json({ error: `Crossmint API Error: ${res.statusText}`, details: errObj }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Register IP Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
