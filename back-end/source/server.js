// const express = require('express');
import express from "express"
import TaskRoutes from "./routes/TaskRoutes.js"

class Server {
    constructor() {
        this.app = express();
        this.configureMiddleware();
        this.setupRoutes();
    }

    configureMiddleware() {

        // TESTING PAGE: UNCOMMENT TO LOAD
        this.app.use(express.static("../frontend/public"));

        // DEV PAGE: COMMENT THE FOLLOWING LINE WHEN USING TESTING PAGE
        // this.app.use(express.static("../frontend"));

        this.app.use(express.json());
    }

    setupRoutes() {
        this.app.use("/v1", TaskRoutes);
    }

    start(port = 3000) {
        this.app.listen(port, () => {
            console.log(`Server is running on http://127.0.0.1:${port}`);
        });
    }
}

console.log("Starting server...");
const server = new Server();
server.start();
