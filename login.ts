import { Router, createToken } from '/core.ts'
import { loadSync } from 'dotenv'

const login = Router()

login.post('', async (req, res, next) => {
  try {
    const masterKey = Deno.env.get('PASSWORD') ?? loadSync().PASSWORD
    const password = req.body.password
    if (password === undefined)
      return res.status(400).json({ error: 'No password provided' })
    if (password !== masterKey)
      return res.status(401).json({ error: 'Invalid password' })
    const token = await createToken()
    return res.status(200).json({ token })
  }
  catch (e) {
    next(e)
  }
})

login.all('*', (req, res) => {
  return res.status(405).json({ error: `${req.method} is not allowed` })
})

export default login
