import {
  createConfig,
  type AlchemyAccountsUIConfig,
  type CreateConfigProps,
} from "@account-kit/react"
import { alchemy } from "@account-kit/infra"
import { QueryClient } from "@tanstack/react-query"
import { getStoryChain } from "@/lib/sdk/story/chains"

const storyChain = getStoryChain()

const transport = alchemy({
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
})

const customStorage = () => ({
  getItem: (key: string) => {
    if (typeof document === "undefined") return null
    const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`))
    return match ? decodeURIComponent(match[2]) : null
  },
  setItem: (key: string, value: string) => {
    if (typeof document === "undefined") return
    const isHttps =
      typeof window !== "undefined" && window.location?.protocol === "https:"
    document.cookie = `${key}=${encodeURIComponent(value)}; max-age=2592000; path=/; SameSite=Lax${isHttps ? "; Secure" : ""}`
  },
  removeItem: (key: string) => {
    if (typeof document === "undefined") return
    const isHttps =
      typeof window !== "undefined" && window.location?.protocol === "https:"
    document.cookie = `${key}=; max-age=0; path=/; SameSite=Lax${isHttps ? "; Secure" : ""}`
  },
  clear: () => {
    if (typeof document === "undefined") return
    const isHttps =
      typeof window !== "undefined" && window.location?.protocol === "https:"
    for (const cookie of document.cookie.split(";")) {
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax${isHttps ? "; Secure" : ""}`
    }
  },
  length: 0,
  key: () => null,
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5,
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
})

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: "linear",
  auth: {
    sections: [
      [{ type: "email", emailMode: "otp" }, { type: "passkey" }],
      [
        { type: "social", authProviderId: "google", mode: "popup" },
        { type: "social", authProviderId: "apple", mode: "popup" },
      ],
    ],
    addPasskeyOnSignup: true,
  },
}

export const config = createConfig(
  {
    transport,
    chain: storyChain,
    chains: [{ chain: storyChain, transport }],
    ssr: true,
    enablePopupOauth: true,
    sessionConfig: {
      expirationTimeMs: 1000 * 60 * 60 * 24 * 30,
      storage: customStorage(),
    },
    accountConfig: {
      type: "ModularAccountV2",
      accountParams: {
        mode: "7702",
      },
      gasManagerConfig: process.env.NEXT_PUBLIC_STORY_POLICY_ID
        ? {
            policyId: process.env.NEXT_PUBLIC_STORY_POLICY_ID,
          }
        : undefined,
    },
  } as CreateConfigProps,
  uiConfig,
)
