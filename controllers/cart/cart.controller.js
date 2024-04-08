const httpErrors = require('http-errors');
const joiCart = require('../../utils/joi/cart/cart.joi_validtion');
const CartModel = require("../../models/cart/cart.model");
const { logger } = require("../../utils/error_logger/winston");
const CartService = require("../../services/cart/cart.service");
const { makeAxiosGetRequest } = require('../../utils/common');
const { PRODUCT_SERVICE_BASE_URL, JWT_ACCESS_TOKEN_HEADER } = require('../../config');

const cartService = new CartService();

const addItemInCart = async (req, res, next) => {
    try {
        const cartItemDetails = await joiCart.addItemInCartSchema.validateAsync(req.body);

        const headers = {
            Cookie: `access-token=${req.cookies[JWT_ACCESS_TOKEN_HEADER]}`
        }

        const productId = cartItemDetails.product._id;

        const { product } = await makeAxiosGetRequest(`${PRODUCT_SERVICE_BASE_URL}/api/get-product/${productId}`, headers).catch(error => {
            throw httpErrors.NotFound('product does not exist');
        });

        if (product.unit === 0) throw httpErrors.NotFound("Item is out of stock");

        const cart = await cartService.addProductInCart(cartItemDetails.product, req.payloadData.userId);

        if (res.headersSent === false) {
            res.status(201).send({
                error: false,
                data: {
                    cart: cart,
                    message: "Product is added in cart successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

const updateCartItem = async (req, res, next) => {
    try {
        const cartDetails = await joiCart.updateCartItemSchema.validateAsync(req.body);

        const cart = await cartService.updateCartItems(cartDetails.cartId, cartDetails.productId, cartDetails.quantity);

        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    cart: cart,
                    message: "Cart item is updated successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

const getcart = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.payloadData.userId);

        const cartSubTotal = await cartService.getCartItemsSubTotal(cart.items);

        // Send the response
        if (res.headersSent === false) {
            res.status(200).send({
                error: false,
                data: {
                    cart: cart,
                    subTotal: cartSubTotal,
                    message: "Cart fetched successfully",
                },
            });
        }

    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

const deleteCartItem = async (req, res, next) => {
    try {
        const cartDetails = await joiCart.deleteCartProductSchema.validateAsync(req.params);

        const cart = await cartService.deleteCartItem(cartDetails.cartId, cartDetails.productId)

        if (res.headersSent === false) {
            res.status(201).send({
                error: false,
                data: {
                    message: "Product from cart deleted successfully",
                },
            });

        }
    } catch (error) {
        console.log(error);
        if (error?.isJoi === true) error.status = 422;
        logger.error(error.message, { status: error.status, path: __filename });
        next(error);
    }
}

module.exports = {
    addItemInCart,
    updateCartItem,
    getcart,
    deleteCartItem
}