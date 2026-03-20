import { StorageClient, immutable } from "@lens-chain/storage-client";

const storageClient = StorageClient.create();
const STORY_MAINNET_CHAIN_ID = 1514;
const acl = immutable(STORY_MAINNET_CHAIN_ID);

/**
 * Uploads a file (e.g. from an input element) to Grove via the Client Storage SDK.
 */
export async function uploadFileToGrove(file: File): Promise<{ uri: string, gatewayUrl: string }> {
  try {
    const response = await storageClient.uploadFile(file, { acl });
    return {
      uri: response.uri,
      gatewayUrl: response.gatewayUrl
    };
  } catch (error) {
    console.error("Failed to upload file to Grove:", error);
    throw error;
  }
}

/**
 * Uploads JSON metadata to Grove via the Client Storage SDK.
 */
export async function uploadMetadataToGrove(metadata: any): Promise<{ uri: string, gatewayUrl: string }> {
  try {
    const response = await storageClient.uploadAsJson(metadata, { acl });
    return {
      uri: response.uri,
      gatewayUrl: response.gatewayUrl
    };
  } catch (error) {
    console.error("Failed to upload metadata to Grove:", error);
    throw error;
  }
}

/**
 * Resolves a lens:// or ipfs:// or ar:// URI into an HTTP gateway URL.
 */
export function resolveGroveURI(uri: string): string {
  if (!uri) return '';
  
  if (uri.startsWith('lens://')) {
    return storageClient.resolve(uri);
  }
  
  // Use public gateways for native ipfs/arweave if we have old data
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  
  if (uri.startsWith('ar://')) {
    return uri.replace('ar://', 'https://arweave.net/');
  }

  // If it's already an HTTP URL (e.g. gatewayUrl), just return it
  return uri;
}
