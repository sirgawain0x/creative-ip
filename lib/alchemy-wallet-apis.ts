/**
 * Re-export: viem-style client for Alchemy Smart Wallet APIs (EIP-7702, signing, prepare/send calls).
 * Use when you need programmatic wallet operations outside `@account-kit/react` UI hooks.
 * In v5 this package replaces `@account-kit/wallet-client`; see the migration guide in the docs.
 *
 * Related v5 reference (bundler / accounts / shared transport):
 * - Wallet APIs (most app-level RPC): https://www.alchemy.com/docs/wallets/reference/wallet-apis
 * - `@alchemy/aa-infra` — Rundler fee estimation + bundler RPC types (`estimateFeesPerGas`, `RundlerClient`, `RundlerRpcSchema`): https://www.alchemy.com/docs/wallets/reference/aa-infra
 * - `@alchemy/common` — `alchemyTransport`, chain registry, shared errors: https://www.alchemy.com/docs/wallets/reference/common
 * - `@alchemy/smart-accounts` — viem smart account implementations (Light / Modular): https://www.alchemy.com/docs/wallets/reference/smart-accounts
 *
 * @see https://www.alchemy.com/docs/wallets/reference/wallet-apis
 * @see https://www.alchemy.com/docs/wallets/resources/migration-v5
 *
 * Implemented in-repo:
 * - `alchemy-v5-bundler.ts` — `alchemyTransport`, Rundler `estimateFeesPerGas`, `createStoryAlchemyBundlerClient`
 * - `alchemy-smart-accounts.ts` — Light / Modular account constructors
 */
export {
  createSmartWalletClient,
  alchemyWalletTransport,
} from "@alchemy/wallet-apis";
