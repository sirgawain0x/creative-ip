import cron from 'node-cron';
import db from '../database';
import { routeDDEXDelivery } from './ingestion-router';
import { deleteFromMega } from './s4-client';

// Runs every day at 00:01 (12:01 AM)
export const setupMidnightReleaser = () => {
    cron.schedule('1 0 * * *', async () => {
        console.log("⏰ Running Midnight Release Queue Check...");
        const today = new Date();

        try {
            // Find all albums where the release date is today (or earlier) and status is HELD
            const pendingReleases = await db.releaseQueue.findMany({
                where: {
                    releaseDate: { lte: today },
                    status: 'HELD'
                }
            });

            if (pendingReleases.length === 0) {
                 console.log("No pending releases found.");
            }

            for (let release of pendingReleases) {
                console.log(`Unlocking Release: ${release.albumTitle}`);
                
                try {
                    // Re-run the router (it will see the date is now valid and process it immediately)
                    await routeDDEXDelivery(release.megaS4FileName);
                    
                    // Mark as completed in DB
                    await db.releaseQueue.update({
                        where: { id: release.id },
                        data: { status: 'RELEASED' }
                    });

                    // Delete the master zip from the MEGA S4 drop zone internally to save space
                    await deleteFromMega(process.env.MEGA_S4_BUCKET, release.megaS4FileName);

                } catch (error) {
                    console.error(`Failed to release ${release.albumTitle}:`, error);
                }
            }
        } catch (e) {
            console.error("Cron Database Query Failed:", e);
        }
    });
};
