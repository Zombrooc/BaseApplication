import { Server } from 'http'
import socket from 'socket.io'
import { json, urlencoded } from 'body-parser'
import express, { NextFunction, Response, Request } from 'express'
import { config } from 'dotenv'
// import path from 'path'
import mongoose from 'mongoose'
import cors from 'cors'
import usersRoutes from './Routes/Users'
import productsRoutes from './Routes/Products'

interface IaddSocketIo extends Request {
  io: socket.Server
}

config()
const app = express()
const server = new Server(app)
const io = socket(server)

app.use(json())
app.use(
  urlencoded({
    extended: false
  })
)

app.use(cors())

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})

app.use((req: IaddSocketIo, res: Response, next: NextFunction) => {
  req.io = io
  next()
})

app.use('/users', usersRoutes)
app.use('/products', productsRoutes)

server.listen(process.env.PORT || 3333, () => {
  console.log(
    `⚡️[server]: Server is running at https://localhost:${
      process.env.PORT || 3333
    }`
  )
})
