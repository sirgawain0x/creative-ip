"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlchemyAccountProvider } from "@account-kit/react";
import "@account-kit/react/styles.css";
import { alchemyAccountConfig } from "@/lib/alchemy-account-config";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider
        config={alchemyAccountConfig}
        queryClient={queryClient}
      >
        {children}
      </AlchemyAccountProvider>
    </QueryClientProvider>
  );
}
