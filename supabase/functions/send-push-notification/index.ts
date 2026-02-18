import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── VAPID & Web Push helpers ────────────────────────────────────────

function base64UrlToUint8Array(base64url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4)
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, a) => sum + a.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const a of arrays) {
    result.set(a, offset)
    offset += a.length
  }
  return result
}

// HKDF (RFC 5869) using Web Crypto
async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  // Extract
  const prkKey = await crypto.subtle.importKey('raw', salt.length > 0 ? salt : new Uint8Array(32), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const prk = new Uint8Array(await crypto.subtle.sign('HMAC', prkKey, ikm))
  // Expand
  const infoAndOne = concatUint8Arrays(info, new Uint8Array([1]))
  const expandKey = await crypto.subtle.importKey('raw', prk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const okm = new Uint8Array(await crypto.subtle.sign('HMAC', expandKey, infoAndOne))
  return okm.slice(0, length)
}

function createInfo(type: string, clientPublicKey: Uint8Array, serverPublicKey: Uint8Array): Uint8Array {
  const encoder = new TextEncoder()
  const typeBytes = encoder.encode(type)
  // "Content-Encoding: <type>\0" P-256 "\0" len(clientPubKey) clientPubKey len(serverPubKey) serverPubKey
  const header = encoder.encode('Content-Encoding: ')
  const nul = new Uint8Array([0])
  const p256 = encoder.encode('P-256')
  const clientLen = new Uint8Array(2)
  clientLen[0] = 0; clientLen[1] = clientPublicKey.length
  const serverLen = new Uint8Array(2)
  serverLen[0] = 0; serverLen[1] = serverPublicKey.length
  return concatUint8Arrays(header, typeBytes, nul, p256, nul, clientLen, clientPublicKey, serverLen, serverPublicKey)
}

async function encryptPayload(
  clientPublicKeyBase64: string,
  authSecretBase64: string,
  payload: string
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const clientPublicKeyBytes = base64UrlToUint8Array(clientPublicKeyBase64)
  const authSecret = base64UrlToUint8Array(authSecretBase64)
  const payloadBytes = new TextEncoder().encode(payload)

  // Generate server ECDH keypair
  const serverKeys = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
  const serverPublicKeyExported = new Uint8Array(await crypto.subtle.exportKey('raw', serverKeys.publicKey))

  // Import client public key
  const clientPublicKey = await crypto.subtle.importKey('raw', clientPublicKeyBytes, { name: 'ECDH', namedCurve: 'P-256' }, false, [])

  // ECDH shared secret
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'ECDH', public: clientPublicKey },
    serverKeys.privateKey,
    256
  ))

  // Generate random salt (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // HKDF to derive PRK from auth secret
  const authInfo = new TextEncoder().encode('Content-Encoding: auth\0')
  const prk = await hkdf(authSecret, sharedSecret, authInfo, 32)

  // Derive Content Encryption Key (CEK)
  const cekInfo = createInfo('aesgcm', clientPublicKeyBytes, serverPublicKeyExported)
  const cek = await hkdf(salt, prk, cekInfo, 16)

  // Derive nonce
  const nonceInfo = createInfo('nonce', clientPublicKeyBytes, serverPublicKeyExported)
  const nonce = await hkdf(salt, prk, nonceInfo, 12)

  // Pad payload (2-byte padding length prefix + payload)
  const paddingLength = 0
  const paddingBytes = new Uint8Array(2 + paddingLength)
  paddingBytes[0] = (paddingLength >> 8) & 0xff
  paddingBytes[1] = paddingLength & 0xff
  const paddedPayload = concatUint8Arrays(paddingBytes, payloadBytes)

  // Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt'])
  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    aesKey,
    paddedPayload
  ))

  return { encrypted, salt, serverPublicKey: serverPublicKeyExported }
}

async function createVapidAuthHeader(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  subject: string
): Promise<{ authorization: string; cryptoKey: string }> {
  const endpointUrl = new URL(endpoint)
  const audience = `${endpointUrl.protocol}//${endpointUrl.host}`

  // JWT header
  const header = { typ: 'JWT', alg: 'ES256' }
  const now = Math.floor(Date.now() / 1000)
  const claims = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: subject,
  }

  const headerB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(header)))
  const claimsB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(claims)))
  const unsignedToken = `${headerB64}.${claimsB64}`

  // Import VAPID private key for signing
  const privateKeyBytes = base64UrlToUint8Array(vapidPrivateKey)
  const publicKeyBytes = base64UrlToUint8Array(vapidPublicKey)

  // Create JWK from raw ECDSA keys
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: uint8ArrayToBase64Url(publicKeyBytes.slice(1, 33)),
    y: uint8ArrayToBase64Url(publicKeyBytes.slice(33, 65)),
    d: uint8ArrayToBase64Url(privateKeyBytes),
  }

  const signingKey = await crypto.subtle.importKey(
    'jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  )

  const signatureBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    signingKey,
    new TextEncoder().encode(unsignedToken)
  )

  // Convert DER signature to JWS format (r || s, each 32 bytes)
  const signatureArray = new Uint8Array(signatureBuffer)
  let r: Uint8Array, s: Uint8Array

  if (signatureArray.length === 64) {
    // Already in raw format
    r = signatureArray.slice(0, 32)
    s = signatureArray.slice(32, 64)
  } else {
    // DER format: 0x30 len 0x02 rLen r 0x02 sLen s
    let offset = 2 // skip 0x30 and total length
    offset++ // skip 0x02
    const rLen = signatureArray[offset++]
    const rRaw = signatureArray.slice(offset, offset + rLen)
    r = rLen > 32 ? rRaw.slice(rLen - 32) : rRaw
    if (r.length < 32) {
      const padded = new Uint8Array(32)
      padded.set(r, 32 - r.length)
      r = padded
    }
    offset += rLen
    offset++ // skip 0x02
    const sLen = signatureArray[offset++]
    const sRaw = signatureArray.slice(offset, offset + sLen)
    s = sLen > 32 ? sRaw.slice(sLen - 32) : sRaw
    if (s.length < 32) {
      const padded = new Uint8Array(32)
      padded.set(s, 32 - s.length)
      s = padded
    }
  }

  const jwsSignature = uint8ArrayToBase64Url(concatUint8Arrays(r, s))
  const jwt = `${unsignedToken}.${jwsSignature}`

  return {
    authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
    cryptoKey: `p256ecdsa=${vapidPublicKey}`,
  }
}

async function sendWebPush(
  subscription: any,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; status?: number; error?: string }> {
  const endpoint = subscription.endpoint
  const p256dh = subscription.keys.p256dh
  const auth = subscription.keys.auth

  try {
    // 1. Encrypt payload
    const { encrypted, salt, serverPublicKey } = await encryptPayload(p256dh, auth, payload)

    // 2. Create VAPID headers
    const vapidHeaders = await createVapidAuthHeader(endpoint, vapidPublicKey, vapidPrivateKey, vapidSubject)

    // 3. Send to push service
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': vapidHeaders.authorization,
        'Crypto-Key': `${vapidHeaders.cryptoKey};dh=${uint8ArrayToBase64Url(serverPublicKey)}`,
        'Content-Encoding': 'aesgcm',
        'Encryption': `salt=${uint8ArrayToBase64Url(salt)}`,
        'Content-Type': 'application/octet-stream',
        'TTL': '86400',
        'Urgency': 'high',
      },
      body: encrypted,
    })

    if (response.status === 201 || response.status === 200) {
      return { success: true, status: response.status }
    }

    const errorText = await response.text()
    console.error(`Push failed: ${response.status} ${errorText}`)

    // 410 Gone = subscription expired, should be cleaned up
    if (response.status === 410 || response.status === 404) {
      return { success: false, status: response.status, error: 'subscription_expired' }
    }

    return { success: false, status: response.status, error: errorText }
  } catch (err) {
    console.error('Push send error:', err)
    return { success: false, error: err.message }
  }
}

// ─── Main handler ────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')
    const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:noreply@voyagesmart.app'

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error('VAPID keys not configured. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY secrets.')
    }

    const payload = await req.json()
    const { user_id, title, message, link } = payload

    if (!user_id) throw new Error('user_id is required')

    // 1. Recupera le sottoscrizioni
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('user_push_subscriptions')
      .select('id, subscription_json')
      .eq('user_id', user_id)

    if (subError) throw subError

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`Nessuna sottoscrizione push trovata per ${user_id}`)
      return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`Invio push a ${subscriptions.length} dispositivi per ${user_id}...`)

    // 2. Prepara il payload JSON per il SW
    const pushPayload = JSON.stringify({
      title: title || 'VoyageSmart',
      message: message || 'Hai una nuova notifica',
      link: link || '/',
    })

    // 3. Invio notifiche con protocollo Web Push completo
    const results = await Promise.all(subscriptions.map(async (sub: any) => {
      const result = await sendWebPush(
        sub.subscription_json,
        pushPayload,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY,
        VAPID_SUBJECT
      )

      // Cleanup sottoscrizioni scadute
      if (result.error === 'subscription_expired') {
        console.log(`Rimozione sottoscrizione scaduta ${sub.id}`)
        await supabaseClient
          .from('user_push_subscriptions')
          .delete()
          .eq('id', sub.id)
      }

      return {
        ...result,
        endpoint: sub.subscription_json.endpoint?.split('/').pop()?.substring(0, 12) + '...'
      }
    }))

    const successCount = results.filter(r => r.success).length
    console.log(`Push inviate: ${successCount}/${results.length} successo`)

    return new Response(JSON.stringify({
      success: successCount > 0,
      sent_count: successCount,
      total: results.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Errore funzione push:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
