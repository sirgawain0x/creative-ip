'use client'

import { CrossmintProvider, CrossmintAuthProvider, CrossmintWalletProvider } from "@crossmint/client-sdk-react-ui";

const clientApiKey = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_KEY as string;

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CrossmintProvider apiKey={clientApiKey}>
            <CrossmintAuthProvider
                loginMethods={["google", "twitter", "farcaster", "email"]}
            >
                <CrossmintWalletProvider
                    createOnLogin={{
                        chain: "story-testnet",
                        signer: {
                            type: "passkey",
                        },
                    }}
                >
                    {children}
                </CrossmintWalletProvider>
            </CrossmintAuthProvider>
        </CrossmintProvider>
    );
}
