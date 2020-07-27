import { Request, Response } from 'express'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
// const { OAuth2Client } = require('google-auth-library');

import authConfig from '../config/auth.json'
import User from '../Models/User'

export default {
  async store (req: Request, res: Response) {
    const { fullName, email, password } = req.body

    if (await User.findOne({ email: email })) {
      return res.status(409).send({
        field: 'email',
        message: 'Já existe um usuário com esse e-mail'
      })
    }

    const name = fullName.split(' ')

    const firstName = name[0]
    const lastName = name[name.length - 1]

    const newUser = new User({
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      email: email,
      password: password
    })

    try {
      await newUser.save()

      newUser.password = undefined
      newUser.isFodaBagarai = undefined

      return res.send({
        user: newUser,
        token: jwt.sign({ id: newUser.id }, authConfig.secret, {
          expiresIn: 1586465556615
        })
      })
    } catch (error) {
      return res.send(error)
    }
  },
  async authenticate (req: Request, res: Response) {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res
        .status(404)
        .send({ error: 'Nenhum usuário encontrado com esse e-mail' })
    }

    if (!(await bcrypt.compareSync(password, user.password))) {
      return res.status(403).send({ error: 'Senha incorreta' })
    }

    user.password = undefined

    res.send({
      user,
      token: jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: 1586465556615
      })
    })
  },
  // async tokenSignIn(req, res){

  //   const { tokenID } = req.body;

  //   try{
  //     const client = new OAuth2Client("397791177987-udqqjh8jo7pgmri2aqj0kc78tfj1jjh7.apps.googleusercontent.com");
  //     const ticket = await client.verifyIdToken({
  //         idToken: tokenID,
  //         audience: "397791177987-udqqjh8jo7pgmri2aqj0kc78tfj1jjh7.apps.googleusercontent.com",
  //     });
  //     const payload = ticket.getPayload();

  //     const user = await User.findOne({ email: payload.email });

  //     if (user){
  //       return res.send({
  //         user,
  //         token: jwt.sign({id: user.id}, authConfig.secret, {
  //           expiresIn: 1586465556615
  //         })
  //       })
  //     }else{

  //       const newUser = await User.create({
  //         full_name: payload.name,
  //         first_name: payload.given_name,
  //         last_name: payload.family_name,
  //         email: payload.email
  //       });

  //       return res.send({
  //         user: newUser,
  //         token: jwt.sign({id: newUser.id}, authConfig.secret, {
  //           expiresIn: 1586465556615
  //         })
  //       })
  //     }
  //   }catch(error){
  //     console.log(error);
  //   }

  // },
  async show (req: Request, res: Response) {
    const user = await User.findById(req.body.userID)

    return res.send(user)
  }
}
