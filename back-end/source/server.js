// const express = require('express');
import dotenv from "dotenv"
import express from "express"
import session from "express-session"
import routes from "./routes/Routes.js"
import env from "./auth/env.js"

class Server {
    constructor() {
        this.app = express();
        this.configureMiddleware();
        this.setupRoutes();
    }


    configureMiddleware() {

        // TESTING PAGE: UNCOMMENT TO LOAD
        // this.app.use(express.static("../frontend/public"));

        // DEV PAGE: COMMENT THE FOLLOWING LINE WHEN USING TESTING PAGE
        this.app.use(express.static("../frontend"));

        // Add session / needed auth stuff
        this.app.use(express.urlencoded({extended: false}));

        this.app.use(
            session({
                secret: env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,
            })
        );

        this.app.use(express.json());
    }

    setupRoutes() {
        this.app.use("/v1", routes);
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
