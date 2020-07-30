import { compareSync } from 'bcryptjs'
import { Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
// const { OAuth2Client } = require('google-auth-library');

import authConfig from '../config/auth.json'
import User from '../Models/User'

export default {
  async store (req: Request, res: Response): Promise<Response> {
    const { fullName, email, password } = req.body

    if (await User.findOne({ email })) {
      return res.status(409).send({
        field: 'email',
        message: 'Já existe um usuário com esse e-mail',
      })
    }

    const name = fullName.split(' ')

    const firstName = name[0]
    const lastName = name[name.length - 1]

    const newUser = new User({
      firstName,
      lastName,
      fullName,
      email,
      password,
    })

    try {
      await newUser.save()

      newUser.password = undefined
      newUser.isFodaBagarai = undefined

      return res.send({
        user: newUser,
        token: jwt.sign({ id: newUser.id }, authConfig.secret, {
          expiresIn: 1586465556615,
        }),
      })
    } catch (error) {
      return res.send(error)
    }
  },
  async authenticate (req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res
        .status(404)
        .send({ error: 'Nenhum usuário encontrado com esse e-mail' })
    }

    if (!(await compareSync(password, user.password))) {
      return res.status(403).send({ error: 'Senha incorreta' })
    }

    user.password = undefined

    return res.send({
      user,
      token: jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: 1586465556615,
      }),
    })
  },
  async show (req: Request, res: Response): Promise<Response> {
    const user = await User.findById(req.body.userID)

    return res.send(user)
  },
}
