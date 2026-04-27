import { DDEXAlbumData, DDEXTrack } from "./parser";

export async function registerStoryIPAsset(
    albumData: DDEXAlbumData, 
    track: DDEXTrack, 
    artistWallet: string, 
    arweaveURI: string
): Promise<string> {
    console.log(`\n--- Registering ${track.title} on Story Protocol ---`);

    const baseUrl = process.env.IP_REGISTRY_API_BASE?.replace(/\/$/, "");
    const apiKey = process.env.IP_REGISTRY_API_KEY || "";
    const collectionId = process.env.IP_REGISTRY_COLLECTION_ID;
    const projectId = process.env.IP_REGISTRY_PROJECT_ID;

    if (!baseUrl || !apiKey || !collectionId || !projectId) {
        throw new Error(
            "Configure IP_REGISTRY_API_BASE, IP_REGISTRY_API_KEY, IP_REGISTRY_COLLECTION_ID, and IP_REGISTRY_PROJECT_ID."
        );
    }

    const headers = {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
    };

    // STEP 1: Gasless / server-side collection mint (registry-specific)
    console.log("Minting base NFT via registry API...");
    const mintRes = await fetch(`${baseUrl}/2022-06-09/collections/${collectionId}/nfts`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            recipient: `email:${artistWallet}:base-sepolia`,
            metadata: {
                name: track.title,
                description: `Official track from ${albumData.albumTitle}`,
                animation_url: arweaveURI,
                attributes: [
                    { trait_type: "ISRC", value: track.isrc },
                    { trait_type: "Artist", value: albumData.artist }
                ]
            }
        })
    });
    
    if (!mintRes.ok) {
        const errorText = await mintRes.text();
        throw new Error(`Failed to mint NFT: ${mintRes.statusText} - ${errorText}`);
    }
    
    const mintData = await mintRes.json();
    console.log(`✅ NFT Minted: ${mintData.id}`);

    // STEP 2: Register as IP Asset
    console.log("Registering as Story IP Asset...");
    const ipRes = await fetch(`${baseUrl}/v1-alpha2/projects/${projectId}/story/ip-assets`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            nftTokenId: mintData.id,
            ipMetadata: {
                title: track.title,
                description: `Official audio for ${track.title} by ${albumData.artist}`,
                ipType: "Music", // Maps to ASSET_TYPES in register-ip-wizard.tsx
                attributes: [{ key: "ISRC", value: track.isrc }]
            }
        })
    });
    
    if (!ipRes.ok) {
        const errorText = await ipRes.text();
        throw new Error(`Failed to register IP Asset: ${ipRes.statusText} - ${errorText}`);
    }

    const ipData = await ipRes.json();

    // STEP 3: Attach Commercial License
    console.log("Attaching commercial license terms...");
    const licenseRes = await fetch(`${baseUrl}/v1-alpha2/projects/${projectId}/story/licenses`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            ipAssetId: ipData.ipAssetId,
            licenseTerms: {
                type: "commercial-use",
                commercialRevShare: 10 // Matches the default 10% royalty in the UI wizard
            }
        })
    });

    if (!licenseRes.ok) {
        const errorText = await licenseRes.text();
        throw new Error(`Failed to attach license: ${licenseRes.statusText} - ${errorText}`);
    }

    console.log(`✅ IP Asset Registered successfully: ${ipData.ipAssetId}`);
    return ipData.ipAssetId;
}
