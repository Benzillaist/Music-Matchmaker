import SpotifyWebApi from "spotify-web-api-node";

class SpotifyController {
    constructor() {
        this.spotifyApi = new SpotifyWebApi({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            redirectUri: process.env.REDIRECT_URL
        });
    }

    // =====================================
    // ======= SPOTIFY API UTILITIES =======
    // =====================================

    async spotifyAuth(req, res) {
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
    }
    
    async callback(req, res) {
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
            res.redirect('/?view=home');
    
            setInterval(async () => {
                const data = await this.spotifyApi.refreshAccessToken();
                const accessTokenRefreshed = data.body['access_token'];
                this.spotifyApi.setAccessToken(accessTokenRefreshed);
            }, 1000 * expiresIn / 2);
        }).catch(error => {
            console.error("Error:", error);
            res.redirect('/?view=auth');
            res.error("Error getting spotifyApi access token")
        })
    }

    // User data

    async getMe(req, res) {
        this.spotifyApi.getMe().then(result => {
            res.json(result);
        }).catch(error => {
            console.log("Error:", error);
            res.status(400).json({error: "Unable to get user"});
        });
    }

    async getUser(req, res) {
        const user_id = req.params.id;
        this.spotifyApi.getUser()
    }

    // Other info
    
    async getTrack(req, res) {
        const song_id = req.params.id;
        this.spotifyApi.getTrack(song_id).then(result => {
            res.json(result);
        }).catch(error => {
            console.log("Error:", error);
            res.status(400).json({error: "Unable to get track"});
        });
    }
    
    async getArtist(req, res) {
        const artist_id = req.params.id;
        this.spotifyApi.getArtist(artist_id).then(result => {
            res.json(result);
        }).catch(error => {
            console.log("Error:", error);
            res.status(400).json({error: "Unable to get artist"});
        });
    }

    // Playlists
    
    async getPlaylist(req, res) {
        const playlist_id = req.params.id;
        this.spotifyApi.getPlaylist(playlist_id).then(result => {
            res.json(result);
        }).catch(error => {
            console.log("Error:", error);
            res.status(400).json({error: "Unable to get playlist"});
        });
    }

    async createPlaylist(req, res) {
        this.spotifyApi.createPlaylist(req.body.name, {'public': true}).then(result => {
            res.json(result);
        }).catch(error => {
            console.log("Error:", error);
            res.status(400).json({error: "Unable to create playlist"});
        });
    }

    async addTrack(req, res) {
        this.spotifyApi.addTracksToPlaylist(req.body.playlist_id, [`spotify:track:${req.body.track_id}`]).then(result => {
            res.json(result);
        }).catch(error => {
            console.log("Error:", error);
            res.status(400).json({error: "Unable to add track"});
        });
    }

    async topTracks(req, res) {
        this.spotifyApi.getMyTopTracks().then(result => {
            res.json(result);
        }).catch(error => {
            console.log("Error:", error);
            res.status(400).json({error: "Unable to get top tracks"});
        });
    }
}

export default new SpotifyController