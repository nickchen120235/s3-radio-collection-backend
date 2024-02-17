import { S3, type S3Object } from 's3'
import { loadSync } from 'dotenv'
import { Router, verifyToken } from '/core.ts'

const s3 = new S3({
  accessKeyID: Deno.env.get('TEBI_KEY') ?? loadSync().TEBI_KEY,
  secretKey: Deno.env.get('TEBI_SECRET') ?? loadSync().TEBI_SECRET,
  region: 'global',
  endpointURL: 'https://s3.tebi.io'
})
const bucket = s3.getBucket(Deno.env.get('TEBI_BUCKET') ?? loadSync().TEBI_BUCKET)

const s3Router = Router()

s3Router.get('', async (req, res, next) => {
  try {
    const token = req.header('Authorization')
    if (token === undefined)
      return res.status(401).json({ error: 'No authorization header provided' })
    if (!await verifyToken(token))
      return res.status(401).json({ error: 'Invalid authorization token' })
    const list = await bucket.listObjects()
    if (!list)
      throw new Error('Could not list objects')
    const contents = list.contents as Required<S3Object>[]
    const keys = contents.filter(x => x.size === 0).map(x => x.key.split('/')[0])
    const files = contents.filter(x => x.size !== 0).map(x => x.key.split('/')) as [string, string][]
    const data: { [key: string]: string[] } = {}
    for (const key of keys) {
      data[key] = files.filter(x => x[0] === key).map(x => x[1])
    }
    return res.status(200).json(data)
  }
  catch (e) {
    next(e)
  }
})

s3Router.all('*', (req, res) => {
  return res.status(405).json({ error: `${req.method} is not allowed` })
})

export default s3Router
