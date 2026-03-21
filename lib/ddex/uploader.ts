import * as fs from 'fs';
import { DDEXTrack } from "./parser";
import { Uploader } from "@irys/upload";
import { Ethereum } from "@irys/upload-ethereum";

const getIrysUploader = async () => {
    // Requires process.env.IRYS_PRIVATE_KEY and process.env.BASE_RPC_URL
    const irysUploader = await Uploader(Ethereum)
        .withWallet(process.env.IRYS_PRIVATE_KEY as string)
        .withRpc(process.env.BASE_RPC_URL as string);
    return irysUploader;
};

export async function uploadToIrys(filePath: string, track: DDEXTrack): Promise<string> {
    console.log(`\n--- Uploading ${track.title} (${track.fileName}) to Irys/Arweave ---`);

    try {
        console.log(`Starting Irys upload for ${filePath}...`);
        
        const irys = await getIrysUploader();
        const mimeType = filePath.endsWith('.wav') ? "audio/wav" : "audio/mpeg";
        
        const tags = [{ name: "Content-Type", value: mimeType }];
        
        const receipt = await irys.uploadFile(filePath, { tags });
        const uri = `https://gateway.irys.xyz/${receipt.id}`;
        
        console.log(`✅ Upload successful: ${uri}`);
        
        return uri;
    } catch (error) {
        console.error("Irys Upload Error:", error);
        throw new Error(`Failed to upload ${track.fileName} to Irys.`);
    }
}
