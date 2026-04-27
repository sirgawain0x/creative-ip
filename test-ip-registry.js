import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const collectionId = process.env.IP_REGISTRY_COLLECTION_ID;
  const apiKey = process.env.IP_REGISTRY_API_KEY;
  const baseUrl = (
    process.env.IP_REGISTRY_API_BASE || ""
  ).replace(/\/$/, "");

  if (!collectionId || !apiKey || !baseUrl) {
    console.log(
      "Set IP_REGISTRY_COLLECTION_ID, IP_REGISTRY_API_KEY, and IP_REGISTRY_API_BASE in .env.local"
    );
    return;
  }

  const jsonBody = {
    owner: "email:test@example.com:story-testnet",
    nftMetadata: {
      name: "Test Name",
      description: "Test description",
    },
    ipAssetMetadata: {
      title: "Test Name",
      ipType: "music",
      attributes: [],
    },
  };

  let res = await fetch(
    `${baseUrl}/v1/ip/collections/${collectionId}/ipassets`,
    {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonBody),
    }
  );
  console.log("JSON response status:", res.status);
  console.log(await res.text());

  const formData = new FormData();
  formData.append("owner", "email:test@example.com:story-testnet");
  formData.append("nftMetadata", JSON.stringify(jsonBody.nftMetadata));
  formData.append("ipAssetMetadata", JSON.stringify(jsonBody.ipAssetMetadata));

  res = await fetch(`${baseUrl}/v1/ip/collections/${collectionId}/ipassets`, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
    },
    body: formData,
  });

  console.log("\nFormData response status:", res.status);
  console.log(await res.text());
}

main().catch(console.error);
