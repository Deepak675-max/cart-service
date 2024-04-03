const CartModel = require("../../models/cart/cart.model");
const httpErrors = require('http-errors');

class CartService {
    async addProductInCart(product, userId) {
        const cart = await this.getCart(userId);
        if (!cart) {
            return await CartModel.create({
                userId: userId,
                items: [{ product: { ...product }, unit: 1 }]
            })
        }

        const cartItems = cart.items;
        if (cartItems.length > 0) {
            const productIndex = await this.findProductIndexInCartItems(cartItems, product._id);
            if (productIndex != -1)
                cartItems[productIndex].unit += 1;
            else
                cartItems.push({ product: { ...product }, unit: 1 });
        } else {
            cartItems.push({ product: { ...product }, unit: 1 });
        }

        cart.items = cartItems;

        await cart.save();

        return cart;
    }

    async updateCartItems(cartId, productId, quantity) {
        try {
            const cart = await this.getCartById(cartId);

            if (!cart) throw httpErrors.NotFound('Cart not found');

            const cartItems = cart.items;

            const productIndex = await this.findProductIndexInCartItems(cartItems, productId);

            cartItems[productIndex].unit = quantity;

            cart.items = cartItems;

            await cart.save();

            return cart;

        } catch (error) {
            throw error;
        }
    }

    async deleteCartItem(cartId, productId) {
        try {
            const cart = await this.getCartById(cartId);

            if (!cart) throw httpErrors.NotFound('Cart not found');

            let cartItems = cart.items;

            cartItems = cartItems.filter(item => item.product._id.toString() != productId);

            cart.items = cartItems;

            await cart.save();

            return cart;
        } catch (error) {
            throw error;
        }
    }

    async deleteCart(userId) {
        try {
            const cart = await this.getCart(userId);

            if (!cart) throw httpErrors.NotFound('Cart not found');

            cart.items = [];

            await cart.save();

            return cart;
        } catch (error) {
            throw error;
        }
    }

    async findProductIndexInCartItems(cartItems, productId) {
        const productIndex = cartItems.findIndex(item => item.product._id.toString() == productId.toString());
        return productIndex;
    }

    async getCartById(cartId) {
        const cart = await CartModel.findOne({
            _id: cartId
        });
        return cart;
    }

    async getCart(userId) {
        const cart = await CartModel.findOne({
            userId: userId
        });
        return cart;
    }

    async getCartItemsSubTotal(cartItems) {
        let subTotal = 0;
        cartItems.map(item => {
            subTotal += item.product.price * item.unit;
        })
        return subTotal;
    }

    async SubscribeEvents(payload) {

        const { userId, event } = payload;

        switch (event) {
            case 'GET_CART':
                const cart = await this.getCart(userId);
                const subTotal = await this.getCartItemsSubTotal(cart.items);
                return { cart, subTotal };
                break;
            case 'DELETE_CART_ITEMS':
                await this.deleteCart(userId);
                break;
            default:
                break;
        }

    }
}

module.exports = CartService;