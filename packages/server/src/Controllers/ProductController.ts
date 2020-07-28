import { Request, Response, NextFunction } from 'express'
import { File } from 'multer'

import User from '../Models/User'
import Product from '../Models/Product'

import { FileUploader } from '../services/fileUtils'

interface IMulterRequest extends Request {
  file: File
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

    const { userID, discount } = req.body

    const { originalname, buffer, mimeType } = req.file

    const user = await User.findById(userID).select('+isFodaBagarai')

    if (!user.isFodaBagarai) {
      return res.status(401).send({ error: 'Usuário não autorizado' })
    }

    const fileUploader = new FileUploader()
    fileUploader.uploadFile(originalname, buffer, mimeType, next)
    const publicUrl = fileUploader.getUrl()

    const newProduct = await Product.create({
      ...req.body,
      discount: discount || 0,
      image: publicUrl
    })
    newProduct.userID = undefined
    req.io.emit('newProduct', newProduct)
    return res.status(200).send(newProduct)
  },
  async index(req: Request, res: Response): Promise<Response> {
    const products = await Product.find({})
      .populate('userID')
      .sort('-createdAt')
    return res.send(products)
  },
  async delete(req: Request, res: Response): Promise<Response> {
    const { productId } = req.params
    const product = await Product.findById(productId)

    product.deleteOne()

    return res.send({
      done: 'Produto excluido com sucesso'
    })
  }
}

export default routes
