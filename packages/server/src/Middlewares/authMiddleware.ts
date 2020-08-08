import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'

import authToken from '../config/auth.json'

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line consistent-return
): Response => {
  const authHeader = req.headers.authorization || req.body.token

  if (!authHeader) {
    return res.status(401).send({ error: 'Nenhum token fornecido' })
  }

  const parts = authHeader.split(' ')

  if (parts.length !== 2) {
    return res.status(401).send({ error: 'Token Error' })
  }

  const [scheme, token] = parts

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).send({ error: 'Token não formatado' })
  }

  verify(token, authToken.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: 'Token Invalido' })
    }

    req.userID = decoded.id
    return next()
  })
}
export default authMiddleware
