const amqplib = require("amqplib");
const CartService = require("../../services/cart/cart.service");
const { CART_QUEUE, ORDER_QUEUE, PRODUCT_QUEUE } = require("../../config/index");

const connectToMessageBroker = async () => {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(CART_QUEUE);
    return { channel, connection };
}

const consumeMessage = (channel) => {
    channel.consume(CART_QUEUE, async (msg) => {
        const payload = JSON.parse(msg.content.toString());
        const cartServiceInstance = new CartService();
        // Retrieve data based on event
        const serviceResponse = await cartServiceInstance.SubscribeEvents(payload);
        // Send service response
        if (serviceResponse) {
            if (payload.service == "Order")
                channel.sendToQueue(ORDER_QUEUE, Buffer.from(JSON.stringify(serviceResponse)));
            if (payload.service == "Product")
                channel.sendToQueue(PRODUCT_QUEUE, Buffer.from(JSON.stringify(serviceResponse)));
        }
    }, { noAck: true });
}

module.exports = {
    connectToMessageBroker,
    consumeMessage
};