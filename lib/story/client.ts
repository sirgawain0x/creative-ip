import { StoryClient, type StoryConfig } from "@story-protocol/core-sdk";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export type StoryNetwork = "aeneid" | "mainnet";

const DEFAULT_RPCS: Record<StoryNetwork, string> = {
    aeneid: "https://aeneid.storyrpc.io",
    mainnet: "https://rpc.story.foundation",
};

export function getStoryClient(network: StoryNetwork): StoryClient {
    const rawKey = process.env.STORY_PRIVATE_KEY;
    if (!rawKey) {
        throw new Error(
            "Missing STORY_PRIVATE_KEY env var. Set it in .env.local (for scripts) or in Vercel (for server routes).",
        );
    }

    const pk = (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) as `0x${string}`;

    const rpc =
        network === "mainnet"
            ? process.env.NEXT_PUBLIC_RPC_PROVIDER_URL || DEFAULT_RPCS.mainnet
            : DEFAULT_RPCS.aeneid;

    const config: StoryConfig = {
        account: privateKeyToAccount(pk),
        transport: http(rpc),
        chainId: network,
    };

    return StoryClient.newClient(config);
}
