// const express = require('express');
import dotenv from "dotenv"
import express from "express"
import session from "express-session"
import passport from "passport";
import routes from "./routes/Routes.js"
import env from "./auth/env.js"
import ModelSwitch from "./model/ModelSwitch.js"

class Server {
    constructor() {
        this.app = express();
        this.configureMiddleware();
        this.setupRoutes();
    }

    // Initialize database before starting server
    async initialize() {
        try {
            console.log("Initializing database models...");
            const models = await ModelSwitch.getModel("sqlite");
            
            // Set to false to preserve existing data
            // Only set to true when you need to rebuild the database schema
            const forceRebuild = false;
            
            await models.userModel.init(forceRebuild);
            await models.groupModel.init(false);
            await models.messageModel.init(false);
            
            console.log("Database initialization complete!");
            return true;
        } catch (error) {
            console.error("Database initialization failed:", error);
            return false;
        }
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

        this.app.use(passport.initialize());
        this.app.use(passport.session());
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

// Initialize DB then start server
server.initialize().then(success => {
    if (success) {
        server.start();
    } else {
        console.error("Server startup aborted due to database initialization failure");
        process.exit(1);
    }
}).catch(error => {
    console.error("Failed to initialize server:", error);
    process.exit(1);
});
