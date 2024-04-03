const express = require("express");

const cartServiceRouter = express.Router();

const authMiddleware = require('../../middlewares/auth.middleware');
const cartController = require('../../controllers/cart/cart.controller');

cartServiceRouter.post('/add-item', authMiddleware.authenticateUser, cartController.addItemInCart);
cartServiceRouter.get('/get-cart', authMiddleware.authenticateUser, cartController.getcart);
cartServiceRouter.put('/update-cart-item', authMiddleware.authenticateUser, cartController.updateCartItem);
cartServiceRouter.delete('/:cartId/product/:productId', authMiddleware.authenticateUser, cartController.deleteCartItem);

module.exports = cartServiceRouter;