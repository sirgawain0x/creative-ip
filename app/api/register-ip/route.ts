import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const dataObj = await req.json();
    
    const title = dataObj.title || 'Untitled';
    const description = dataObj.description || '';
    const ipType = dataObj.ipType || 'music';
    const owner = dataObj.owner;
    
    // Extracted from frontend presigned URL logic
    const finalMediaUrl = dataObj.mediaUrl || "https://cdn1.suno.ai/c001fd6e-d6cd-474f-a7b6-6e6a9b3e2515.mp3";
    const finalImageUrl = dataObj.imageUrl || "https://cdn2.suno.ai/image_large_c001fd6e-d6cd-474f-a7b6-6e6a9b3e2515.jpeg";
    
    const licenses = dataObj.licenses || '';
    const royalty = dataObj.royalty || '10';

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
