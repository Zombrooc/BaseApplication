import { Request, Response, NextFunction } from 'express'
import { File } from 'multer'
import socket from 'socket.io'

import Product from '../Models/Product'
import User from '../Models/User'
import { FileUtils } from '../services/fileUtils'

interface IMulterRequest extends Request {
  file: File
  io: socket.Server,
  userID: String
}

const routes = {
  async store(
    req: IMulterRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    if (!req.file) {
      return res.status(400).send({ error: 'No file to be uploaded.' })
    }

    const { discount } = req.body
    const userID = req.userID

    const { originalname, buffer, mimeType } = req.file

    const user = await User.findById(userID).select('+isFodaBagarai')

    if (!user.isFodaBagarai) {
      return res.status(401).send({ error: 'Usuário não autorizado' })
    }

    const fileUtils = new FileUtils()
    const publicUrl = fileUtils.uploadFile(originalname, buffer, mimeType, next)

    const newProduct = await Product.create({
      ...req.body,
      discount: discount || 0,
      image: publicUrl
    })
    req.io.emit('newProduct', newProduct)
    return res.status(200).send(newProduct)
  },
  async index(req: Request, res: Response): Promise<Response> {
    const products = await Product.find({})
      .sort('-createdAt')
    return res.send(products)
  },
  async show (req: Request, res: Response): Promise<Response> {
    const { productID } = req.params

    const productDetails = await Product.findById(productID)

    return res.send(productDetails)
  },
  async delete(req: Request, res: Response): Promise<Response> {
    const { productId } = req.params

    const product = await Product.findById(productId)

    if (!product) {
      return res.send({
        error:
          'Nenhum produto encontrado com esse ID, talvez ele já tenha sido excluido'
      })
    }

    const fileUtils = new FileUtils()
    const fileName: string = product.image.split('/')[4]
    await fileUtils.deleteFile(fileName)

    await product.deleteOne()

    return res.send({
      done: 'Produto excluido com sucesso'
    })
  }
}

export default routes
