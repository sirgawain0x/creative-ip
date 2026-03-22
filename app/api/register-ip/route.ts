import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const title = formData.get('title') as string || 'Untitled';
    const description = formData.get('description') as string || '';
    const ipType = formData.get('ipType') as string || 'music';
    const owner = formData.get('owner') as string;
    // We get the file from user but Crossmint IPAsset API only accepts public URLs via JSON.
    // In a production app, you would first upload this file to an IPFS/S3 provider.
    const file = formData.get('file') as File | null;
    let imageUri = formData.get('imageUri') as string || '';

    const licenses = formData.get('licenses') as string || '';
    const royalty = formData.get('royalty') as string || '10';

    if (!owner) {
        return NextResponse.json({ error: 'Missing owner address' }, { status: 400 });
    }

    const serverKey = process.env.CROSSMINT_SERVER_KEY;
    if (!serverKey) {
        throw new Error("Missing CROSSMINT_SERVER_KEY in environment variables. Have you added this to Vercel?");
    }

    // Automatically route to staging or production based on the key prefix
    const CROSSMINT_BASE_URL = serverKey.startsWith("sk_live_") 
      ? "https://www.crossmint.com/api" 
      : "https://staging.crossmint.com/api";

    const collectionId = process.env.COLLECTION_ID;
    
    if (!collectionId) {
        throw new Error("Missing COLLECTION_ID in environment variables. Have you added this to Vercel?");
    }

    // Use dummy public URLs for the example
    const MOCK_IMAGE_URL = "https://mintcdn.com/crossmint/wfEo4Py0D7KOM99v/images/solutions/intellectual-property/story.jpeg";
    const MOCK_AUDIO_URL = "https://cdn1.suno.ai/c001fd6e-d6cd-474f-a7b6-6e6a9b3e2515.mp3";
    const MOCK_LIT_URL = "https://example.com/book.epub";

    const isMusic = ipType === 'music';
    const isImage = ipType === 'image';
    const isLit = ipType === 'literature';

    const mediaUrl = isMusic ? MOCK_AUDIO_URL : isLit ? MOCK_LIT_URL : MOCK_IMAGE_URL;
    const mediaType = isMusic ? 'audio/mpeg' : isLit ? 'application/epub+zip' : 'image/jpeg';
    
    const nftMetadata: any = {
      name: title,
      description: description,
      image: isImage ? MOCK_IMAGE_URL : MOCK_IMAGE_URL,
    };
    
    if (!isImage) {
      nftMetadata.animation_url = mediaUrl;
    }

    const ipAssetMetadata: any = {
      title: title,
      ipType: ipType,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      creators: [
          {
              name: 'Creator',
              email: owner.split(':')[1] || 'creator@example.com',
              contributionPercent: 100
          }
      ],
      attributes: [
          { key: 'Type', value: ipType },
          { key: 'Licenses', value: licenses },
          { key: 'RoyaltyRate', value: royalty }
      ]
    };

    const crossmintPayload = {
      owner: owner,
      nftMetadata,
      ipAssetMetadata
    };

    const res = await fetch(`${CROSSMINT_BASE_URL}/v1/ip/collections/${collectionId}/ipassets`, {
      method: "POST",
      headers: {
        "X-API-KEY": serverKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(crossmintPayload)
    });

    if (res.status === 403) {
        return NextResponse.json({ 
            error: `Crossmint API Error: Forbidden. Please ensure your CROSSMINT_SERVER_KEY is set in your Vercel Environment Variables and has the 'nfts.create' and 'collection.create' scopes.` 
        }, { status: 403 });
    }

    if (!res.ok) {
        const errObj = await res.json().catch(() => ({}));
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
