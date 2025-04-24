import "dotenv/config.js"
import express from "express"
import SpotifyWebApi from "spotify-web-api-node";
import DataController from "../controller/DataController.js"


class TaskRoutes {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
        this.spotifyApi = new SpotifyWebApi({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            redirectUri: process.env.REDIRECT_URL
        });

        // TODO: implement better storage system
        this.users = [];
    }

    initializeRoutes() {
        // =====================================
        // ===== SPOTIFY API AUTHORIZATION =====
        // =====================================
        
        this.router.get("/spotifyAuth", (req, res) => {
            const scopes = ['ugc-image-upload',
                'user-read-playback-state',
                'user-modify-playback-state',
                'user-read-currently-playing',
                'streaming',
                'app-remote-control',
                'user-read-email',
                'user-read-private',
                'playlist-read-collaborative',
                'playlist-modify-public',
                'playlist-read-private',
                'playlist-modify-private',
                'user-library-modify',
                'user-library-read',
                'user-top-read',
                'user-read-playback-position',
                'user-read-recently-played',
                'user-follow-read',
                'user-follow-modify'
            ];
        
            const spotifyApiURL = this.spotifyApi.createAuthorizeURL(scopes);
        
            res.json({"url": spotifyApiURL});
        });
        
        this.router.get("/callback", (req, res) => {
            const error = req.query.error;
            const code = req.query.code;
            const state = req.query.state;
        
            if(error) {
                console.error("Error:", error);
                res.send(`Error: ${error}`);
                return;
            }
            this.spotifyApi.authorizationCodeGrant(code).then(data => {
                const accessToken = data.body['access_token'];
                const refreshToken = data.body['refresh_token'];
                const expiresIn = data.body['expires_in'];
        
                this.spotifyApi.setAccessToken(accessToken);
                this.spotifyApi.setRefreshToken(refreshToken);
        
                console.log(accessToken, refreshToken);
                res.redirect('/');
        
                setInterval(async () => {
                    const data = await this.spotifyApi.refreshAccessToken();
                    const accessTokenRefreshed = data.body['access_token'];
                    this.spotifyApi.setAccessToken(accessTokenRefreshed);
                }, 1000 * expiresIn / 2);
            }).catch(error => {
                console.error("Error:", error);
                res.error("Error getting spotifyApi access token")
            })
        });

        // ======================================
        // ===== SPOTIFY API UTILITY ROUTES =====
        // ======================================

        this.router.get("/getMe", (req, res) => {
            this.spotifyApi.getMe().then(result => {
                res.json(result);
            });
        });
        
        this.router.get("/findTrack/:id", (req, res) => {
            const song_id = req.params.id;
            console.log(`Song id: ${song_id}`);
            this.spotifyApi.getTrack(song_id).then(result => {
                res.json(result);
            })
        });
        
        this.router.get("/findArtist/:id", (req, res) => {
            const artist_id = req.params.id;
            this.spotifyApi.getArtist(artist_id).then(result => {
                res.json(result);
            })
        });
        
        this.router.get("/findPlaylist/:id", (req, res) => {
            const playlist_id = req.params.id;
            console.log(playlist_id)
            this.spotifyApi.getPlaylist(playlist_id).then(result => {
                res.json(result);
            })
        })
        
        this.router.post("createPlaylist", (req, res) => {
        
            this.spotifyApi.createPlaylist().th;
        })

        // =====================================
        // ============= USER DATA =============
        // =====================================

    
        this.router.get("/allUsers", async (req, res) => {
            await DataController.getAllUsers(req, res);
        });

        this.router.post("/addUser", async (req, res) => {
            await DataController.addUser(req, res);
        });

        this.router.get("/getUser/:id", async (req, res) => {
            await DataController.getUser(req, res);
        });

        this.router.put("/updateUser", async (req, res) => {
            await DataController.updateUser(req, res);
        });

        this.router.delete("/deleteUser", async (req, res) => {
            await DataController.deleteUser(req, res);
        });

        this.router.delete("/clearUsers", async (req, res) => {
            await DataController.clearUsers(req, res);
        });

        // ======================================
        // ============= GROUP DATA =============
        // ======================================

        this.router.get("/allGroups", async (req, res) => {
            await DataController.getAllGroups(req, res);
        });

        this.router.post("/addGroup", async (req, res) => {
            await DataController.addgroup(req, res);
        });

        this.router.get("/getGroup", async (req, res) => {
            await DataController.getGroup(req, res);
        });

        this.router.put("/updateGroup", async (req, res) => {
            await DataController.updateGroup(req, res);
        });

        this.router.delete("/deleteGroup", async (req, res) => {
            await DataController.deleteGroup(req, res);
        });

        this.router.delete("/clearGroup", async (req, res) => {
            await DataController.clearGroup(req, res);
        });
    }

    getRouter() {
        return this.router;
    }
}

export default new TaskRoutes().getRouter();