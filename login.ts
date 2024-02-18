import { Router, createToken, verifyToken } from '/core.ts'
import { loadSync } from 'dotenv'

type LoginData = { password: string } | { token: string }
function isLoginData(data: any): data is LoginData {
  return data.password !== undefined || data.token !== undefined
}

const login = Router()
login.post('', async (req, res, next) => {
  try {
    const masterKey = Deno.env.get('PASSWORD') ?? loadSync().PASSWORD
    if (!isLoginData(req.body))
      return res.status(400).json({ error: 'No password provided' })
    if ('password' in req.body) {
      if (req.body.password !== masterKey)
        return res.status(401).json({ error: 'Invalid password' })
      const token = await createToken()
      return res.status(200).json({ token })
    }
    else {
      if (!await verifyToken(req.body.token))
        return res.status(401).json({ error: 'Invalid authorization token' })
      return res.status(200).json({ token: req.body.token })
    }
  }
  catch (e) {
    next(e)
  }
})

login.all('*', (req, res) => {
  return res.status(405).json({ error: `${req.method} is not allowed` })
})

export default login
