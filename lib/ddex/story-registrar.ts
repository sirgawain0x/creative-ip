import { http, parseEther, type Address } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { StoryClient, PILFlavor, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk'
import { DDEXAlbumData, DDEXTrack } from './parser'

export async function registerStoryIPAsset(
    albumData: DDEXAlbumData,
    track: DDEXTrack,
    artistWallet: string,
    arweaveURI: string
): Promise<string> {
    console.log(`\n--- Registering ${track.title} on Story Protocol ---`)

    const privateKey = process.env.STORY_PRIVATE_KEY as `0x${string}` | undefined
    if (!privateKey) {
        throw new Error('Missing STORY_PRIVATE_KEY in environment variables.')
    }

    const spgNftContract = process.env.STORY_SPG_NFT_CONTRACT as Address | undefined
    if (!spgNftContract) {
        throw new Error('Missing STORY_SPG_NFT_CONTRACT in environment variables.')
    }

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_PROVIDER_URL || 'https://aeneid.storyrpc.io'
    const chainId = process.env.NODE_ENV === 'production' ? 'mainnet' : 'aeneid'

    const account = privateKeyToAccount(privateKey)
    const storyClient = StoryClient.newClient({
        account,
        transport: http(rpcUrl),
        chainId,
    })

    const ipMetadata = {
        title: track.title,
        description: `Official audio for ${track.title} by ${albumData.artist}`,
        createdAt: new Date().toISOString(),
        ipType: 'Music',
        mediaUrl: arweaveURI,
        creators: [
            {
                name: albumData.artist,
                address: artistWallet,
                contributionPercent: 100,
            },
        ],
        media: [{ name: track.title, url: arweaveURI, mimeType: 'audio/mpeg' }],
        attributes: [
            { key: 'ISRC', value: track.isrc },
            { key: 'Artist', value: albumData.artist },
            { key: 'Album', value: albumData.albumTitle },
        ],
    }

    const nftMetadata = {
        name: track.title,
        description: `Official track from ${albumData.albumTitle}`,
        animation_url: arweaveURI,
        attributes: [
            { trait_type: 'ISRC', value: track.isrc },
            { trait_type: 'Artist', value: albumData.artist },
        ],
    }

    const [ipMeta, nftMeta] = await Promise.all([
        uploadMetadata(ipMetadata, 'ip'),
        uploadMetadata(nftMetadata, 'nft'),
    ])

    console.log('Minting + registering IP asset...')
    const response = await storyClient.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract,
        licenseTermsData: [
            {
                terms: PILFlavor.commercialRemix({
                    commercialRevShare: 10,
                    defaultMintingFee: parseEther('0'),
                    currency: WIP_TOKEN_ADDRESS,
                }),
            },
        ],
        ipMetadata: {
            ipMetadataURI: ipMeta.uri,
            ipMetadataHash: ipMeta.hash,
            nftMetadataURI: nftMeta.uri,
            nftMetadataHash: nftMeta.hash,
        },
    })

    if (!response.ipId) {
        throw new Error(`Story registration succeeded but returned no ipId (tx: ${response.txHash})`)
    }

    console.log(`✅ IP Asset Registered: ${response.ipId} (tx: ${response.txHash})`)
    return response.ipId
}

async function uploadMetadata(
    metadata: Record<string, unknown>,
    kind: 'ip' | 'nft'
): Promise<{ uri: string; hash: `0x${string}` }> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/upload-metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata, kind }),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed to upload ${kind} metadata`)
    }
    return res.json()
}
