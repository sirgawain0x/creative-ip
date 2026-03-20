import * as fs from 'fs';
import { DDEXTrack } from "./parser";

export async function uploadToGrove(filePath: string, track: DDEXTrack): Promise<string> {
    console.log(`\n--- Uploading ${track.title} (${track.fileName}) to Grove IPFS ---`);

    try {
        console.log(`Starting Grove HTTP upload for ${filePath}...`);
        
        const fileData = fs.readFileSync(filePath);
        
        // Post directly to grove API with the correct content type. 1514 is Story mainnet
        const response = await fetch("https://api.grove.storage/?chain_id=1514", {
            method: "POST",
            headers: {
                "Content-Type": filePath.endsWith('.wav') ? "audio/wav" : "audio/mpeg"
            },
            body: fileData
        });
        
        if (!response.ok) {
           throw new Error(`Grove upload failed with status ${response.status}: ${await response.text()}`);
        }
        
        const receipt = await response.json();
        const uri = receipt.uri;
        console.log(`✅ Upload successful: ${uri}`);
        
        return uri;
    } catch (error) {
        console.error("Grove Upload Error:", error);
        throw new Error(`Failed to upload ${track.fileName} to Grove.`);
    }
}
