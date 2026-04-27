import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createHash } from 'crypto'

export async function POST(req: Request) {
  try {
    const { metadata, kind } = await req.json()

    if (!metadata || typeof metadata !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid metadata object' }, { status: 400 })
    }

    const endpoint = process.env.MEGA_S4_ENDPOINT
    if (!endpoint) {
      return NextResponse.json({ error: 'Storage endpoint not configured' }, { status: 500 })
    }

    const s3Client = new S3Client({
      endpoint,
      region: process.env.MEGA_S4_REGION || 'ca-central-1',
      credentials: {
        accessKeyId: process.env.MEGA_S4_ACCESS_KEY!,
        secretAccessKey: process.env.MEGA_S4_SECRET_KEY!,
      },
      forcePathStyle: true,
    })

    const bucketName = process.env.MEGA_S4_BUCKET || 'creative-tv-ddex-inbox'
    const json = JSON.stringify(metadata)
    const hash = createHash('sha256').update(json).digest('hex')
    const prefix = kind === 'nft' ? 'nft-metadata' : 'ip-metadata'
    const key = `${prefix}/${hash}.json`

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: json,
        ContentType: 'application/json',
        ACL: 'public-read',
      })
    )

    const normalizedEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
    const uri = `${normalizedEndpoint}/${bucketName}/${key}`

    return NextResponse.json({ uri, hash: `0x${hash}` })
  } catch (error: any) {
    console.error('Upload metadata error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
