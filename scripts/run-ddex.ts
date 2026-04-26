import { routeDDEXDelivery } from '../lib/ddex/ingestion-router';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.local manually for the script context
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

// Ensure critical variables are set (basic sanity check before running)
if (!process.env.MEGA_S4_ACCESS_KEY || !process.env.STORY_PRIVATE_KEY || !process.env.STORY_SPG_NFT_CONTRACT || !process.env.IRYS_PRIVATE_KEY) {
    console.warn("⚠️ Warning: Missing some DDEX environment variables. Ensure .env.local is fully configured.");
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Usage: npx tsx scripts/run-ddex.ts <fileName.zip>");
        process.exit(1);
    }

    const fileName = args[0];
    await routeDDEXDelivery(fileName);
}

main().catch(error => {
    console.error("Fatal Error:", error);
    process.exit(1);
});
