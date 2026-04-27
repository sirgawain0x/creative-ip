"use client"

import { type PropsWithChildren } from "react"
import { AlchemyAccountProvider } from "@account-kit/react"
import type { AlchemyClientState } from "@account-kit/core"
import { QueryClientProvider } from "@tanstack/react-query"
import { config, queryClient } from "@/config"

export default function Providers({
  children,
  initialState,
}: PropsWithChildren<{ initialState?: AlchemyClientState }>) {
  return (
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider
        config={config}
        queryClient={queryClient}
        initialState={initialState}
      >
        {children}
      </AlchemyAccountProvider>
    </QueryClientProvider>
  )
}
