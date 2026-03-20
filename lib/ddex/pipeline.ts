import { downloadDDEXDelivery } from './s4-client';
import { parseDDEXManifest } from './parser';
import { uploadToGrove } from './uploader'; 
import { registerStoryIPAsset } from './story-registrar';
import extract from 'extract-zip';
import fs from 'fs';
import path from 'path';

export async function processDDEXDelivery(fileName: string): Promise<void> {
    const tmpDir = '/tmp/creative-tv-ddex';
    const localZipPath = path.join(tmpDir, fileName);
    const extractPath = path.join(tmpDir, `unpacked-${fileName}`);

    try {
        console.log(`\n--- Starting DDEX Ingestion Pipeline for ${fileName} ---`);
        
        // 1. Download
        await downloadDDEXDelivery(fileName, localZipPath);
        console.log(`✅ Downloaded ${fileName} to ${localZipPath}`);
        
        // 2. Unpack
        console.log(`Unpacking archive...`);
        await extract(localZipPath, { dir: extractPath });
        console.log(`✅ Extracted to ${extractPath}`);
        
        // Find manifest.xml file (case-insensitive or slightly different naming conventions exist for DDEX, usually 'manifest.xml' or similar)
        let manifestPath = path.join(extractPath, 'manifest.xml');
        if (!fs.existsSync(manifestPath)) {
            // Fallbacks for common DDEX naming conventions
            const files = fs.readdirSync(extractPath);
            const xmlFile = files.find(f => f.toLowerCase() === 'manifest.xml' || f.endsWith('.xml'));
            if (xmlFile) {
                manifestPath = path.join(extractPath, xmlFile);
            } else {
                throw new Error("Could not find manifest.xml in the extracted delivery.");
            }
        }

        // 3. Parse XML & Validate
        console.log(`Parsing manifest...`);
        const albumData = await parseDDEXManifest(manifestPath);
        console.log(`✅ Parsed Album: ${albumData.albumTitle} by ${albumData.artist}`);

        // The artist wallet typically needs to be mapped internally based on your own auth schema
        const artistWallet = "artist@example.com"; 

        // 4. Process & Register Tracks
        for (let track of albumData.tracks) {
            const audioPath = path.join(extractPath, track.fileName);
            
            if (!fs.existsSync(audioPath)) {
                console.warn(`⚠️ Warning: Audio file ${track.fileName} not found for track ${track.title}. Skipping.`);
                continue;
            }

            const arweaveURI = await uploadToGrove(audioPath, track); 
            await registerStoryIPAsset(albumData, track, artistWallet, arweaveURI);
        }

        console.log("\n🎉 DDEX Delivery Successfully Registered to Story Protocol. 🎉");
    } catch (error) {
        console.error("\n❌ Pipeline Failed:", error);
    } finally {
        // Cleanup local files
        try {
            if (fs.existsSync(localZipPath)) fs.unlinkSync(localZipPath);
            if (fs.existsSync(extractPath)) fs.rmSync(extractPath, { recursive: true, force: true });
        } catch (cleanupError) {
            console.error("Cleanup error:", cleanupError);
        }
    }
}
