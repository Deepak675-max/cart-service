const joi = require('joi');

const addItemInCartSchema = joi.object({
    product: joi.object({
        _id: joi.string().trim().required(),
        name: joi.string().trim().required(),
        description: joi.string().trim().required(),
        image: joi.string().trim().required(),
        category: joi.string().trim().required(),
        price: joi.string().trim().required(),
    }),
});

const updateCartItemSchema = joi.object({
    cartId: joi.string().trim().hex().length(24).required(),
    productId: joi.string().trim().required(),
    quantity: joi.number().required()
});

const getCartProductsSchema = joi.object({
    metaData: joi.object({
        orderBy: joi.string().trim().optional().default(null),
        orderDirection: joi.string().trim().optional().default(null),
        page: joi.number().optional().default(null),
        pageSize: joi.number().optional().default(null),
    }).optional().default(null)
});

const deleteCartProductSchema = joi.object({
    cartId: joi.string().trim().hex().length(24).required(),
    productId: joi.string().trim().hex().length(24).required(),
});


module.exports = {
    addItemInCartSchema,
    getCartProductsSchema,
    updateCartItemSchema,
    deleteCartProductSchema
}

