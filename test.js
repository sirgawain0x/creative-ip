import fs from 'fs';

async function main() {
  const file = fs.readFileSync('test.mp3');
  const blob = new Blob([file], { type: 'audio/mpeg' });
  const formData = new FormData();
  formData.append('title', 'Test Music');
  formData.append('description', 'Test Description');
  formData.append('ipType', 'music');
  formData.append('owner', 'email:test@example.com:story-testnet');
  formData.append('file', blob, 'test.mp3');

  const res = await fetch('http://localhost:3000/api/register-ip', {
    method: 'POST',
    body: formData,
  });

  console.log(res.status);
  const data = await res.json();
  console.dir(data, { depth: null });
}

main().catch(console.error);
