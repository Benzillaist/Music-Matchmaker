import "dotenv/config.js"
import express from "express"
import SpotifyController from "../controller/SpotifyController.js"
import DataController from "../controller/DataController.js"
import {
    register,
    login,
    logout,
    getWebapp,
} from "../controller/AuthController.js"
import { isAuthenticated } from "../auth/middleware.js";


class Routes {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {

        // =====================================
        // ===== NAVIGATION + AUTH ROUTING =====
        // =====================================

        // Login + auth routes

        this.router.post("/register", register)
        this.router.post("/login", login);
        this.router.get("/logout", logout);

        // Protected routes

        this.router.get("/webapp", isAuthenticated, getWebapp);


        // =====================================
        // ===== SPOTIFY API AUTHORIZATION =====
        // =====================================

        this.router.get("/spotifyAuth", async (req, res) => {
            await SpotifyController.spotifyAuth(req, res);
        });

        this.router.get("/callback", async (req, res) => {
            await SpotifyController.callback(req, res);
        });

        // // ======================================
        // // ===== SPOTIFY API UTILITY ROUTES =====
        // // ======================================

        this.router.get("/getme", async (req, res) => {
            await SpotifyController.getMe(req, res);
        });

        this.router.get("/user/get/:id", async (req, res) => {
            await SpotifyController.getUser(req, res);
        });
        
        this.router.get("/track/get/:id", async (req, res) => {
            await SpotifyController.getTrack(req, res);
        });
        
        this.router.get("/artist/get/:id", async (req, res) => {
            await SpotifyController.getArtist(req, res);
        });
        
        this.router.get("/playlist/get/:id", async (req, res) => {
            await SpotifyController.getPlaylist(req, res);
        });

        this.router.post("/playlist/create", async (req, res) => {
            await SpotifyController.createPlaylist(req, res);
        });

        this.router.post("/playlist/add", async (req, res) => {
            await SpotifyController.addTrack(req, res);
        })

        this.router.get("/toptracks", async (req, res) => {
            await SpotifyController.topTracks(req, res);
        })

        // =====================================
        // ============= USER DATA =============
        // =====================================

        this.router.get("/users/getall", async (req, res) => {
            await DataController.getAllUsers(req, res);
        });

        this.router.post("/users/create", async (req, res) => {
            await DataController.addUser(req, res);
        });

        this.router.get("/users/get/:id", async (req, res) => {
            await DataController.getUser(req, res);
        });

        this.router.put("/users/update", async (req, res) => {
            await DataController.updateUser(req, res);
        });

        this.router.delete("/users/delete", async (req, res) => {
            await DataController.deleteUser(req, res);
        });

        this.router.delete("/users/clear", async (req, res) => {
            await DataController.clearUsers(req, res);
        });

        // ======================================
        // ============= GROUP DATA =============
        // ======================================

        this.router.get("/groups/getall", async (req, res) => {
            await DataController.getAllGroups(req, res);
        });

        this.router.post("/groups/create", async (req, res) => {
            await DataController.addGroup(req, res);
        });

        this.router.get("/groups/get", async (req, res) => {
            await DataController.getGroup(req, res);
        });

        this.router.put("/groups/update", async (req, res) => {
            await DataController.updateGroup(req, res);
        });

        this.router.delete("/groups/delete", async (req, res) => {
            await DataController.deleteGroup(req, res);
        });

        this.router.delete("/groups/clear", async (req, res) => {
            await DataController.clearGroup(req, res);
        });

        // ======================================
        // ============= CHAT DATA ==============
        // ======================================

        // GET all messages
        this.router.get("/chat", async (req, res) => {
            await DataController.getAllMessages(req, res);
        });

        // POST a new message
        this.router.post("/chat", async (req, res) => {
            await DataController.addMessage(req, res);
        });

        // GET a specific message
        this.router.get("/chat/:id", async (req, res) => {
            await DataController.getMessage(req, res);
        });

        // UPDATE a message
        this.router.put("/chat/:id", async (req, res) => {
            await DataController.updateMessage(req, res);
        });

        // DELETE a message
        this.router.delete("/chat/:id", async (req, res) => {
            await DataController.deleteMessage(req, res);
        });

        // Redirects

        // this.router.post("/MM", async (req, res) => {
        //     await
        // })
    }

    getRouter() {
        return this.router;
    }
}

export default new Routes().getRouter();