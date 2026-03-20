import { Uploader } from "@irys/upload";
import { Ethereum } from "@irys/upload-ethereum";
import { DDEXTrack } from "./parser";

export async function uploadToArweave(filePath: string, track: DDEXTrack): Promise<string> {
    console.log(`\n--- Uploading ${track.title} (${track.fileName}) to Arweave via Irys ---`);

    const rpcURL = process.env.BASE_RPC_URL || "https://sepolia.base.org";
    const privateKey = process.env.IRYS_PRIVATE_KEY;

    if (!privateKey) {
        throw new Error("Missing IRYS_PRIVATE_KEY for Arweave upload.");
    }

    try {
        const irysUploader = await Uploader(Ethereum).withWallet(privateKey).withRpc(rpcURL);
        
        // Ensure funding is sufficient for the file size
        // Note: For production, consider using irysUploader.fund() if unfunded
        // For now, depending on the network, we assume it's funded or auto-funded if configured
        
        console.log(`Starting Irys upload for ${filePath}...`);
        const receipt = await irysUploader.uploadFile(filePath, {
            tags: [
                { name: "Content-Type", value: "audio/wav" }, // Assuming wav based on prompt
                { name: "Title", value: track.title },
                { name: "ISRC", value: track.isrc }
            ]
        });

        const arweaveURI = `ar://${receipt.id}`;
        console.log(`✅ Upload successful: ${arweaveURI}`);
        
        return arweaveURI;
    } catch (error) {
        console.error("Irys Upload Error:", error);
        throw new Error(`Failed to upload ${track.fileName} to Arweave.`);
    }
}
