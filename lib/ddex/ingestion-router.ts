import { downloadDDEXDelivery } from './s4-client';
import { parseDDEXManifest } from './parser';
import { processAndMintRelease } from './pipeline';
import extract from 'extract-zip';
import fs from 'fs';
import path from 'path';
import db from '../database';

export async function routeDDEXDelivery(fileName: string): Promise<void> {
    const tmpDir = '/tmp/creative-tv-ddex';
    const localZipPath = path.join(tmpDir, fileName);
    const extractPath = path.join(tmpDir, `unpacked-${fileName}`);

    try {
        console.log(`\n--- Routing DDEX Delivery: ${fileName} ---`);
        
        await downloadDDEXDelivery(fileName, localZipPath);
        console.log(`✅ Downloaded ${fileName}`);
        
        await extract(localZipPath, { dir: extractPath });
        console.log(`✅ Extracted to ${extractPath}`);
        
        let manifestPath = path.join(extractPath, 'manifest.xml');
        if (!fs.existsSync(manifestPath)) {
            const files = fs.readdirSync(extractPath);
            const xmlFile = files.find(f => f.toLowerCase() === 'manifest.xml' || f.endsWith('.xml'));
            if (xmlFile) manifestPath = path.join(extractPath, xmlFile);
            else throw new Error("Could not find manifest.xml in delivery.");
        }

        const albumData = await parseDDEXManifest(manifestPath);
        const today = new Date();

        if (albumData.releaseDate > today) {
            console.log(`🔒 Pre-Release Detected: ${albumData.albumTitle}. Holding until ${albumData.releaseDate}`);
            
            // Save to internal database queue. DO NOT upload to Arweave.
            await db.releaseQueue.create({
                data: {
                    albumTitle: albumData.albumTitle,
                    artist: albumData.artist,
                    releaseDate: albumData.releaseDate,
                    megaS4FileName: fileName, 
                    status: 'HELD'
                }
            });

            // Clean up extracting directory but preserve the zip on S4
            if (fs.existsSync(extractPath)) fs.rmSync(extractPath, { recursive: true, force: true });
            
        } else {
            console.log(`🚀 Release Date reached/passed. Processing immediately.`);
            await processAndMintRelease(albumData, extractPath, fileName);
        }
    } catch (error) {
        console.error("Pipeline routing failed:", error);
    } finally {
        if (fs.existsSync(localZipPath)) fs.unlinkSync(localZipPath);
    }
}
