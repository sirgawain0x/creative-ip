import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, ipType, imageUri, mediaUri, owner, attributes } = body;

    if (!owner) {
        return NextResponse.json({ error: 'Missing owner address' }, { status: 400 });
    }

    const CROSSMINT_BASE_URL = "https://staging.crossmint.com/api";
    const collectionId = process.env.COLLECTION_ID;
    
    if (!collectionId) {
        throw new Error("Missing COLLECTION_ID in environment variables");
    }

    const payload = {
      owner: owner,
      nftMetadata: {
        name: title,
        description: description,
        image: imageUri
      },
      ipAssetMetadata: {
        title: title,
        ipType: ipType,
        attributes: attributes,
        ...(mediaUri && mediaUri !== imageUri ? { media: [{ name: title, url: mediaUri, mimeType: 'application/octet-stream' }] } : {})
      }
    };

    const res = await fetch(`${CROSSMINT_BASE_URL}/v1/ip/collections/${collectionId}/ipassets`, {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.CROSSMINT_SERVER_KEY || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

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
