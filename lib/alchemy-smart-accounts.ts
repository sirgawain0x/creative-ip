/**
 * Viem-native smart account factories (v5 `@alchemy/smart-accounts`).
 * Pair with `createStoryAlchemyBundlerClient` from `alchemy-v5-bundler.ts` and a signer/owner.
 *
 * @see https://www.alchemy.com/docs/wallets/reference/smart-accounts
 */
export {
  toLightAccount,
  toMultiOwnerLightAccount,
  predictLightAccountAddress,
  toModularAccountV2,
  predictModularAccountV2Address,
} from "@alchemy/smart-accounts";
