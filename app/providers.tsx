'use client'

import {
    CrossmintProvider,
    CrossmintAuthProvider,
    CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";

const clientApiKey = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_KEY as string;

// Crossmint SDK rejects testnet in production; use mainnet when deployed.
// Story chain IDs are supported at runtime but not yet in the SDK's EVM chain union type.
const chain =
    process.env.NODE_ENV === "production" ? "story-mainnet" : "story-testnet";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CrossmintProvider apiKey={clientApiKey}>
            <CrossmintAuthProvider
                loginMethods={["google", "twitter", "farcaster", "email"]}
            >
                <CrossmintWalletProvider
                    createOnLogin={
                        {
                            chain,
                            signer: { type: "passkey" },
                        } as Parameters<
                            typeof CrossmintWalletProvider
                        >[0]["createOnLogin"]
                    }
                >
                    {children}
                </CrossmintWalletProvider>
            </CrossmintAuthProvider>
        </CrossmintProvider>
    );
}
