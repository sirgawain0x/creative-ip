import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { address } = await req.json()

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    const apiKeyName = process.env.CDP_API_KEY_NAME
    const apiPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!apiKeyName || !apiPrivateKey) {
      console.error('Missing CDP API keys')
      return NextResponse.json(
        { error: 'Server misconfiguration: CDP API keys missing' },
        { status: 500 }
      )
    }

    // Build the JWT
    const requestMethod = 'POST'
    const requestPath = '/onramp/v1/buy/quote'
    const url = `https://api.developer.coinbase.com${requestPath}`
    const algorithm = 'ES256'
    const uri = requestMethod + ' ' + url

    const token = jwt.sign(
      {
        iss: 'cdp',
        nbf: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 120,
        sub: apiKeyName,
        uri,
      },
      apiPrivateKey,
      {
        algorithm: algorithm as jwt.Algorithm,
        header: {
          alg: algorithm as jwt.Algorithm,
          kid: apiKeyName,
          nonce: crypto.randomBytes(16).toString('hex'),
        } as unknown as jwt.JwtHeader,
      }
    )

    const quoteBody = {
        purchase_currency: "USDC",
        purchase_network: "ethereum-mainnet", // Specifying fallback or main network
        payment_amount: "50.00", // Required to get a quote, though it can be changed on UI
        payment_currency: "USD",
        payment_method: "CARD",
        country: "US",
        subdivision: "NY",
        destination_address: address
    }

    const response = await fetch(url, {
      method: requestMethod,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(quoteBody),
    })

    const data = await response.json()

    if (!response.ok) {
        console.error('CDP API Error', data)
        return NextResponse.json({ error: data.message || 'Error fetching quote' }, { status: response.status })
    }

    if (data.data && data.data.onramp_url) {
        return NextResponse.json({ onrampUrl: data.data.onramp_url })
    } else {
        return NextResponse.json({ error: 'No onramp URL found in response' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error generating onramp session:', error)
    return NextResponse.json(
      { error: 'Failed to generate onramp session' },
      { status: 500 }
    )
  }
}
