/**
 * Embedded wallet UI via Account Kit (v4.x: `@account-kit/react` + `@account-kit/infra`).
 * Custom viem bundler / account construction lives in the v5 packages; see `lib/alchemy-wallet-apis.ts` doc links.
 */
import { createConfig } from "@account-kit/react";
import { alchemy, storyAeneid, storyMainnet } from "@account-kit/infra";

const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";

const chain =
  process.env.NODE_ENV === "production" ? storyMainnet : storyAeneid;

export const alchemyAccountConfig = createConfig(
  {
    transport: alchemy({ apiKey }),
    chain,
    ssr: true,
  },
  {
    illustrationStyle: "outline",
    auth: {
      sections: [
        [{ type: "email" }],
        [{ type: "passkey" }],
        [
          { type: "social", authProviderId: "google", mode: "popup" },
          { type: "social", authProviderId: "apple", mode: "popup" },
        ],
      ],
    },
  }
);
