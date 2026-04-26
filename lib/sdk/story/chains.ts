import type { Chain } from "viem"
import { storyMainnet, storyAeneid } from "@account-kit/infra"

export { storyMainnet, storyAeneid }

export function getStoryChain(): Chain {
  return process.env.NEXT_PUBLIC_STORY_NETWORK === "mainnet"
    ? storyMainnet
    : storyAeneid
}

export function getStoryChainId(): "mainnet" | "aeneid" {
  return process.env.NEXT_PUBLIC_STORY_NETWORK === "mainnet" ? "mainnet" : "aeneid"
}
