const amqplib = require("amqplib");
const CartService = require("../../services/cart/cart.service");
const { CART_QUEUE, ORDER_CART_QUEUE, CART_PRODUCT_QUEUE } = require("../../config/index");

const { logger } = require("../error_logger/winston");

let channel, connection;

const connectToMessageBroker = async () => {
    try {
        connection = await amqplib.connect('amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue(CART_QUEUE);
    } catch (error) {
        console.log(error);
        logger.error(error.message, { status: error.status, path: __filename });
        throw error;
    }
}

const consumeMessage = () => {
    try {
        channel.consume(CART_QUEUE, async (msg) => {
            const payload = JSON.parse(msg.content.toString());
            const cartServiceInstance = new CartService();
            // Perform action based on event
            await cartServiceInstance.SubscribeEvents(payload);
        }, { noAck: true });
    } catch (error) {
        console.log(error);
        logger.error(error.message, { status: error.status, path: __filename });
        throw error;
    }
}

module.exports = {
    connectToMessageBroker,
    consumeMessage
};