import express from 'express'

import UserController from '../Controllers/UserController'
import AuthMiddleware from '../Middlewares/authMiddleware'

const routes = express.Router()

routes.post('/', UserController.store)
routes.post('/authenticate', UserController.authenticate)
// routes.post('/authenticate/tokensignin', UserController.tokenSignIn);
routes.get('/', AuthMiddleware, UserController.show)

export default routes
