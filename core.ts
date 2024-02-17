// @deno-types="@types/express"
export { Router } from 'express'

import * as uuid from 'uuid'

// note: DENO_KV_PATH will be unset in production
const kv = await Deno.openKv(Deno.env.get('DENO_KV_PATH'))

export async function createToken(): Promise<string> {
  const token = crypto.randomUUID()
  const expireIn = Date.now() + 1000 * 60 * 60 * 24
  await kv.set(["session", token], expireIn, { expireIn })
  return token
}

export async function verifyToken(token: string): Promise<boolean> {
  if (!uuid.validate(token)) return false
  const value = await kv.get<number>(["session", token])
  if (value.value === null) return false
  return Date.now() < value.value
}
