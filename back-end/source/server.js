require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const PORT = 3050;

app.use(express.json());

// Setup config for spotifyApi
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URL
});

app.use(express.static("../frontend/public"));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

let count = 0;
app.get("/html", (req, res) => {
    const body = `
        <h1> Hello, this is a dynamic page served by Express!</h1>
        <p>Count: ${count++}</p>
    `;
    res.send(body);
});

app.get("/test", (req, res) => {
    res.send("Test");
})

app.get("/spotifyAuth", (req, res) => {
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

    const spotifyApiURL = spotifyApi.createAuthorizeURL(scopes);

    res.json({"url": spotifyApiURL});
});

app.get("/callback", (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;

    if(error) {
        console.error("Error:", error);
        res.send(`Error: ${error}`);
        return;
    }
    spotifyApi.authorizationCodeGrant(code).then(data => {
        const accessToken = data.body['access_token'];
        const refreshToken = data.body['refresh_token'];
        const expiresIn = data.body['expires_in'];

        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        console.log(accessToken, refreshToken);
        res.redirect('/');
        // res.send("Successfully authenticated");

        setInterval(async () => {
            const data = await spotifyApi.refreshAccessToken();
            const accessTokenRefreshed = data.body['access_token'];
            spotifyApi.setAccessToken(accessTokenRefreshed);
        }, 1000 * expiresIn / 2);
    }).catch(error => {
        console.error("Error:", error);
        res.error("Error getting spotifyApi access token")
    })
});

app.get("/getMe", (req, res) => {
    spotifyApi.getMe().then(result => {
        res.json(result);
    });
});

app.get("/findTrack", (req, res) => {
    const song_id = req.params.id;
    spotifyApi.getTrack(song_id).then(result => {
        res.json(result);
    })
});

app.get("findArtist", (req, res) => {
    const artist_id = req.params.id;
    spotifyApi.getArtist(artist_id).then(result => {
        res.json(result);
    })
});

app.get("findPlaylist", (req, res) => {
    const playlist_id = req.params.id;
    spotifyApi.getPlaylist(playlist_id).then(result => {
        res.json(result);
    })
})

app.get("createPlaylist", (req, res) => {

    spotifyApi.createPlaylist
})