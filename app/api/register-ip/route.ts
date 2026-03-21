import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const title = formData.get('title') as string || 'Untitled';
    const description = formData.get('description') as string || '';
    const ipType = formData.get('ipType') as string || 'music';
    const owner = formData.get('owner') as string;
    const file = formData.get('file') as File | null;
    let imageUri = formData.get('imageUri') as string || '';

    const licenses = formData.get('licenses') as string || '';
    const royalty = formData.get('royalty') as string || '10';

    if (!owner) {
        return NextResponse.json({ error: 'Missing owner address' }, { status: 400 });
    }

    const CROSSMINT_BASE_URL = "https://staging.crossmint.com/api";
    const collectionId = process.env.COLLECTION_ID;
    
    if (!collectionId) {
        throw new Error("Missing COLLECTION_ID in environment variables");
    }

    const crossmintFormData = new FormData();
    crossmintFormData.append('owner', owner);
    
    const nftMetadata: any = {
      name: title,
      description: description,
    };
    
    const ipAssetMetadata: any = {
      title: title,
      ipType: ipType,
      attributes: [
          { key: 'Type', value: ipType },
          { key: 'Licenses', value: licenses },
          { key: 'RoyaltyRate', value: royalty }
      ]
    };

    if (file) {
      if (ipType === 'image' || file.type.startsWith('image/')) {
        crossmintFormData.append('image', file);
      } else {
        crossmintFormData.append('animation_url', file);
        if (imageUri) nftMetadata.image = imageUri;
      }
    } else if (imageUri) {
      nftMetadata.image = imageUri;
    }

    crossmintFormData.append('nftMetadata', JSON.stringify(nftMetadata));
    crossmintFormData.append('ipAssetMetadata', JSON.stringify(ipAssetMetadata));

    const res = await fetch(`${CROSSMINT_BASE_URL}/v1/ip/collections/${collectionId}/ipassets`, {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.CROSSMINT_SERVER_KEY || "",
      },
      body: crossmintFormData
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
