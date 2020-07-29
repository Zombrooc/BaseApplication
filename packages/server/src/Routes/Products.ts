import multer from 'multer'
import express from 'express'

import ProductController from '../Controllers/ProductController'
import authMiddleware from '../Middlewares/authMiddleware'

import uploadConfig from '../config/upload'

const upload = multer(uploadConfig)

const routes = express.Router()

routes.post(
  '/',
  authMiddleware,
  upload.single('image'),
  ProductController.store
)
routes.get('/', ProductController.index)
routes.delete('/:productId', authMiddleware, ProductController.delete)

export default routes
