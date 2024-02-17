// @deno-types="@types/express"
import express, { Request, Response, NextFunction } from 'express'
// @deno-types="@types/cors"
import cors from 'cors'

import login from '/login.ts'
import s3Router from '/s3.ts'

const app = express()
/* middlewares */
app.use(express.json())
// @ts-expect-error everyone writes like this
app.use(cors())

/* routes */
app.use('/login', login)
app.use('/', s3Router)

/* 404 handler */
app.use((_, res, __) => {
  return res.status(404).json({ error: 'Not found' })
})

/* 500 handler */
app.use((e: unknown, _: Request, res: Response, __: NextFunction) => {
  if (e instanceof Error) {
    console.error(e.stack)
    return res.status(500).json({ error: `${e.name}: ${e.message}` })
  }
  else {
    console.error(JSON.stringify(e))
    return res.status(500).json({ error: 'Unknown error. Check logs' })
  }
})

app.listen(8000, () => console.log('Server is running'))
