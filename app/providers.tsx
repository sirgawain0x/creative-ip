"use client"

import { type PropsWithChildren } from "react"
import "@account-kit/react/styles.css"
import { AlchemyAccountProvider } from "@account-kit/react"
import type { AlchemyClientState } from "@account-kit/core"
import { QueryClientProvider } from "@tanstack/react-query"
import { config, queryClient } from "@/config"

let accountKitRejectionHandlerInstalled = false
let cursorHydrationWarningFilterInstalled = false

function installAccountKitRejectionHandler() {
  if (
    accountKitRejectionHandlerInstalled ||
    process.env.NODE_ENV !== "development" ||
    typeof window === "undefined"
  ) {
    return
  }

  accountKitRejectionHandlerInstalled = true
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason?.message === "Must be authenticated!") {
      event.preventDefault()
    }
  })
}

function installCursorHydrationWarningFilter() {
  if (
    cursorHydrationWarningFilterInstalled ||
    process.env.NODE_ENV !== "development" ||
    typeof window === "undefined"
  ) {
    return
  }

  cursorHydrationWarningFilterInstalled = true
  const originalError = console.error
  console.error = (...args) => {
    const message = args.map(String).join(" ")
    if (
      message.includes("A tree hydrated but some attributes") &&
      message.includes("data-cursor-ref")
    ) {
      return
    }

    originalError(...args)
  }
}

export default function Providers({
  children,
  initialState,
}: PropsWithChildren<{ initialState?: AlchemyClientState }>) {
  installAccountKitRejectionHandler()
  installCursorHydrationWarningFilter()

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
