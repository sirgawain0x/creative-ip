import { DDEXAlbumData } from './parser';
import { uploadToIrys } from './uploader'; 
import { registerStoryIPAsset } from './story-registrar';
import extract from 'extract-zip';
import fs from 'fs';
import path from 'path';

export async function processAndMintRelease(albumData: DDEXAlbumData, extractPath: string, megaS4FileName: string): Promise<void> {
    try {
        console.log(`\n--- Processing DDEX Release: ${albumData.albumTitle} (${megaS4FileName}) ---`);
        
        // The artist wallet typically needs to be mapped internally based on your own auth schema
        const artistWallet = "artist@example.com"; 

        // 4. Process & Register Tracks
        for (let track of albumData.tracks) {
            const audioPath = path.join(extractPath, track.fileName);
            
            if (!fs.existsSync(audioPath)) {
                console.warn(`⚠️ Warning: Audio file ${track.fileName} not found for track ${track.title}. Skipping.`);
                continue;
            }

            const arweaveURI = await uploadToIrys(audioPath, track); 
            await registerStoryIPAsset(albumData, track, artistWallet, arweaveURI);
        }

        console.log("\n🎉 DDEX Delivery Successfully Registered to Story Protocol. 🎉");
    } catch (error) {
        console.error("\n❌ Pipeline Processing Failed:", error);
    } finally {
        try {
            if (fs.existsSync(extractPath)) fs.rmSync(extractPath, { recursive: true, force: true });
        } catch (cleanupError) {
            console.error("Cleanup error:", cleanupError);
        }
    }
}
