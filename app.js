const express = require('express');
const httpErrors = require("http-errors");
const cors = require("cors");
const path = require("path");
const cartServiceBackendApp = express();
const http = require('http');
const cookieParser = require('cookie-parser');
require("./utils/database/init_mongodb");
const server = http.createServer(cartServiceBackendApp);
const { APP_PORT } = require("./config/index");
const { connectToMessageBroker, consumeMessage } = require("./utils/message_broker/rabbitmq");
cartServiceBackendApp.use(cors({
    origin: "*",
    credentials: true,
}));

cartServiceBackendApp.use(cookieParser());
cartServiceBackendApp.use(express.json());
cartServiceBackendApp.use(express.urlencoded({ extended: true }));
cartServiceBackendApp.use(express.static(path.join(__dirname, 'public')));

// connectToMessageBroker().then(() => {
//     consumeMessage();
// });

const cartServiceRoutes = require("./routes/cart/cart.routes");
cartServiceBackendApp.use("/api", cartServiceRoutes);

cartServiceBackendApp.use(async (req, _res, next) => {
    next(httpErrors.NotFound(`Route not Found for [${req.method}] ${req.url}`));
});

// Common Error Handler
cartServiceBackendApp.use((error, req, res, next) => {
    const responseStatus = error.status || 500;
    const responseMessage =
        error.message || `Cannot resolve request [${req.method}] ${req.url}`;
    if (res.headersSent === false) {
        res.status(responseStatus);
        res.send({
            error: {
                status: responseStatus,
                message: responseMessage,
            },
        });
    }
    next();
});

const port = APP_PORT;

server.listen(port, async () => {
    console.log("Cart Service is running on the port " + port)
    await connectToMessageBroker();
    consumeMessage();
})




