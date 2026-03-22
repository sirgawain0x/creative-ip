import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const collectionId = process.env.COLLECTION_ID;
  const apiKey = process.env.CROSSMINT_SERVER_KEY;
  
  // 1x1 pixel base64 PNG
  const dataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  const jsonBody = {
    owner: "email:test@example.com:story-testnet",
    nftMetadata: {
      name: "Test Name",
      description: "Test description",
      image: dataUri
    },
    ipAssetMetadata: {
      title: "Test Name",
      ipType: "image",
      attributes: [],
      mediaUrl: dataUri
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
}

main().catch(console.error);
