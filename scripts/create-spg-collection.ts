import "dotenv/config";
import { zeroAddress } from "viem";
import { getStoryClient, type StoryNetwork } from "../lib/story/client";

async function main() {
    const arg = process.argv[2];
    if (arg && arg !== "aeneid" && arg !== "mainnet") {
        throw new Error(`Unknown network "${arg}". Use "aeneid" or "mainnet".`);
    }
    const network: StoryNetwork = (arg as StoryNetwork) ?? "aeneid";

    console.log(`[${network}] Creating SPG NFT collection...`);

    const client = getStoryClient(network);

    const res = await client.nftClient.createNFTCollection({
        name: "Creative IP",
        symbol: "CIP",
        isPublicMinting: false,
        mintOpen: true,
        mintFeeRecipient: zeroAddress,
        contractURI: "",
    });

    console.log(`[${network}] tx hash:         ${res.txHash}`);
    console.log(`[${network}] spgNftContract:  ${res.spgNftContract}`);
    console.log(
        `\nPaste the address above into NEXT_PUBLIC_SPG_NFT_CONTRACT and STORY_SPG_NFT_CONTRACT\nfor the matching environment (Preview/Dev for aeneid, Production for mainnet).`,
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
