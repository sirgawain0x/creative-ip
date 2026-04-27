"use client";

import {
  useAccount,
  useAuthModal,
  useLogout,
  useSignerStatus,
} from "@account-kit/react";

/** Mirrors the old embedded-wallet hook shape used across the app. */
export type StoryWalletStatus = "idle" | "loading" | "loaded";

export function useWallet() {
  const { isConnected, isInitializing, isAuthenticating } = useSignerStatus();
  const { address, isLoadingAccount } = useAccount({ type: "LightAccount" });

  const status: StoryWalletStatus = (() => {
    if (!isConnected && !isInitializing) return "idle";
    if (
      isInitializing ||
      isAuthenticating ||
      isLoadingAccount ||
      !address
    ) {
      return "loading";
    }
    return "loaded";
  })();

  return {
    status,
    wallet: address ? { address } : undefined,
  };
}

export function useAuth() {
  const { openAuthModal } = useAuthModal();
  const { logout } = useLogout();
  return {
    login: () => openAuthModal(),
    logout: () => {
      logout();
    },
  };
}
