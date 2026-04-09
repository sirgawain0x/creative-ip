import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const dataObj = await req.json();

    const title = dataObj.title || 'Untitled';
    const description = dataObj.description || '';
    const ipType = dataObj.ipType || 'music';
    const owner = dataObj.owner;

    const finalMediaUrl = dataObj.mediaUrl || "";
    const finalImageUrl = dataObj.imageUrl || "";

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

    const isMusic = ipType === 'music';
    const isLit = ipType === 'literature';

    const mediaUrl = isMusic ? finalMediaUrl : isLit ? finalMediaUrl : finalMediaUrl;
    const mediaType = isMusic ? 'audio/mpeg' : isLit ? 'application/epub+zip' : 'image/jpeg';

    const nftMetadata: any = {
      name: title,
      description: description,
      image: finalImageUrl,
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
        finalOwnerLocator = `story-testnet:${owner}`;
        creatorAddress = owner;
    } else if (owner.startsWith('story-testnet:')) {
        creatorAddress = owner.replace('story-testnet:', '');
    }

    // Build ipAssetMetadata matching Crossmint Music Quickstart docs
    const ipAssetMetadata: any = {
      title: title,
      createdAt: new Date().toISOString(),
      ipType: ipType,
      image: finalImageUrl,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      creators: [
          {
              name: 'Creator',
              crossmintUserLocator: finalOwnerLocator,
              contributionPercent: 100
          }
      ],
      media: [
          {
              name: title,
              url: mediaUrl,
              mimeType: mediaType
          }
      ],
      attributes: attributes
    };

    const crossmintPayload = {
      owner: finalOwnerLocator,
      nftMetadata,
      ipAssetMetadata
    };

    const requestUrl = `${CROSSMINT_BASE_URL}/v1/ip/collections/${COLLECTION_ID}/ipassets`;
    console.log("Crossmint request URL:", requestUrl);
    console.log("Crossmint request payload:", JSON.stringify(crossmintPayload, null, 2));

    const res = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "X-API-KEY": CROSSMINT_SERVER_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(crossmintPayload)
    });

    if (!res.ok) {
        const errObj = await res.json().catch(() => ({}));
        const crossmintMessage = errObj.message || JSON.stringify(errObj);
        console.error("Crossmint API Error:", res.status, crossmintMessage, errObj);

        return NextResponse.json({
            error: `Crossmint API Error (${res.status}): ${crossmintMessage}`,
            details: errObj
        }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Register IP Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
