import { NextResponse } from "next/server";

/**
 * Registers an IP asset via your configured HTTP registry (collection mint API).
 * Set IP_REGISTRY_API_BASE (e.g. https://…/api), IP_REGISTRY_API_KEY, and IP_REGISTRY_COLLECTION_ID.
 * Request/response shapes depend on the provider; the payload below matches common Story collection flows.
 */
export async function POST(req: Request) {
  try {
    const dataObj = await req.json();

    const title = dataObj.title || "Untitled";
    const description = dataObj.description || "";
    const ipType = dataObj.ipType || "music";
    const owner = dataObj.owner;

    const finalMediaUrl = dataObj.mediaUrl || "";
    const finalImageUrl = dataObj.imageUrl || "";

    const licenses = dataObj.licenses || "";
    const royalty = dataObj.royalty || "10";

    if (!owner) {
      return NextResponse.json({ error: "Missing owner address" }, { status: 400 });
    }

    const apiKey = process.env.IP_REGISTRY_API_KEY;
    const baseUrl = process.env.IP_REGISTRY_API_BASE?.replace(/\/$/, "");
    const collectionId = process.env.IP_REGISTRY_COLLECTION_ID;

    if (!apiKey) {
      throw new Error(
        "Missing IP_REGISTRY_API_KEY. Add it to your environment (e.g. Vercel project env)."
      );
    }
    if (!baseUrl) {
      throw new Error(
        "Missing IP_REGISTRY_API_BASE (root URL of your IP/collection registry API, no trailing slash)."
      );
    }
    if (!collectionId) {
      throw new Error("Missing IP_REGISTRY_COLLECTION_ID.");
    }

    const isMusic = ipType === "music";
    const isLit = ipType === "literature";

    const mediaUrl = finalMediaUrl;
    const mediaType = isMusic
      ? "audio/mpeg"
      : isLit
        ? "application/epub+zip"
        : "image/jpeg";

    const nftMetadata: Record<string, unknown> = {
      name: title,
      description: description,
      image: finalImageUrl,
    };

    const attributes: { key: string; value: string }[] = [
      { key: "Type", value: ipType },
      { key: "Licenses", value: licenses },
      { key: "RoyaltyRate", value: royalty },
    ];

    let ownerLocator = owner;
    if (owner.startsWith("0x")) {
      ownerLocator = `story-testnet:${owner}`;
    }

    const ipAssetMetadata: Record<string, unknown> = {
      title: title,
      createdAt: new Date().toISOString(),
      ipType: ipType,
      image: finalImageUrl,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      creators: [
        {
          name: "Creator",
          // Legacy registry field name required by some Story collection APIs
          crossmintUserLocator: ownerLocator,
          contributionPercent: 100,
        },
      ],
      media: [
        {
          name: title,
          url: mediaUrl,
          mimeType: mediaType,
        },
      ],
      attributes: attributes,
    };

    const payload = {
      owner: ownerLocator,
      nftMetadata,
      ipAssetMetadata,
    };

    const requestUrl = `${baseUrl}/v1/ip/collections/${collectionId}/ipassets`;

    const res = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errObj = await res.json().catch(() => ({}));
      const message =
        (errObj as { message?: string }).message || JSON.stringify(errObj);
      console.error("IP registry API error:", res.status, message, errObj);

      return NextResponse.json(
        {
          error: `Registry API error (${res.status}): ${message}`,
          details: errObj,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Register IP route error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
