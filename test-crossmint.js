import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const collectionId = process.env.COLLECTION_ID;
  const apiKey = process.env.CROSSMINT_SERVER_KEY;
  
  if (!collectionId || !apiKey) {
    console.log("Missing env vars");
    return;
  }

  // First try JSON
  const jsonBody = {
    owner: "email:test@example.com:story-testnet",
    nftMetadata: {
      name: "Test Name",
      description: "Test description"
    },
    ipAssetMetadata: {
      title: "Test Name",
      ipType: "music",
      attributes: []
    }
  };

  let res = await fetch(`https://staging.crossmint.com/api/v1/ip/collections/${collectionId}/ipassets`, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(jsonBody)
  });
  console.log("JSON response status:", res.status);
  console.log(await res.text());

  // Now try FormData exactly like route.ts does
  const formData = new FormData();
  formData.append('owner', 'email:test@example.com:story-testnet');
  formData.append('nftMetadata', JSON.stringify(jsonBody.nftMetadata));
  formData.append('ipAssetMetadata', JSON.stringify(jsonBody.ipAssetMetadata));
  
  res = await fetch(`https://staging.crossmint.com/api/v1/ip/collections/${collectionId}/ipassets`, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey
    },
    body: formData
  });

  console.log("\nFormData response status:", res.status);
  console.log(await res.text());
}

main().catch(console.error);
