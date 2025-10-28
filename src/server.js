import 'dotenv/config'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import morgan from 'morgan'
import { enqueueChatMessage } from './sqs.js'
import { v4 as uuid } from 'uuid'
import { StatusCodes } from 'http-status-codes'

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(express.static('web'))

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  socket.on('chat:send', async (payload) => {
    const message = {
      id: uuid(),
      ts: Date.now(),
      user: payload?.user || 'anonymous',
      text: String(payload?.text || ''),
    }
    io.emit('chat:recv', message)
    try { await enqueueChatMessage(message) } catch {}
  })
})

app.get('/health', (req, res) => res.status(StatusCodes.OK).json({ ok: true, ts: Date.now() }))

const port = process.env.PORT || 8080
server.listen(port, () => console.log(`listening on http://localhost:${port}`))
