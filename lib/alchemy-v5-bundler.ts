import { alchemyTransport } from "@alchemy/common";
import { storyMainnet } from "@alchemy/common/chains";
import { estimateFeesPerGas as alchemyEstimateFeesPerGas } from "@alchemy/aa-infra";
import { storyAeneid } from "@account-kit/infra";
import { createBundlerClient } from "viem/account-abstraction";
import type { Chain } from "viem";

/**
 * Story chain for viem clients: Aeneid testnet in development, mainnet in production.
 * Testnet uses `@account-kit/infra` (same IDs as Account Kit UI); mainnet uses `@alchemy/common/chains`.
 */
export function getStoryChainV5(): Chain {
  return process.env.NODE_ENV === "production" ? storyMainnet : storyAeneid;
}

/** Shared Alchemy HTTP transport for viem (v5 `@alchemy/common`). */
export function createAlchemyHttpTransport(apiKey: string) {
  return alchemyTransport({ apiKey });
}

/**
 * Bundler client with Alchemy Rundler gas estimation (`estimateFeesPerGas` from `@alchemy/aa-infra`).
 * Use when sending user operations outside Account Kit hooks.
 *
 * @see https://www.alchemy.com/docs/wallets/reference/aa-infra
 */
export function createStoryAlchemyBundlerClient(apiKey: string) {
  const chain = getStoryChainV5();
  const transport = createAlchemyHttpTransport(apiKey);
  return createBundlerClient({
    chain,
    transport,
    userOperation: {
      estimateFeesPerGas: alchemyEstimateFeesPerGas,
    },
  });
}

export { alchemyEstimateFeesPerGas };
