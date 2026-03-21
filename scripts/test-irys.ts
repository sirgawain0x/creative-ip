import { Uploader } from "@irys/upload";
import { Ethereum } from "@irys/upload-ethereum";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    try {
        const uploader = await Uploader(Ethereum).withWallet(process.env.IRYS_PRIVATE_KEY).withRpc(process.env.BASE_RPC_URL);
        console.log("Irys initialized. Node:", uploader.url);
        // let's try a tiny buffer upload
        const receipt = await uploader.upload("Hello creative-ip");
        console.log("Uploaded:", receipt.id);
    } catch (e) {
        console.error("Irys setup failed", e);
    }
}

main();
