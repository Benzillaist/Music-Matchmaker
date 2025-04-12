const clientId = '1898c3c834e04da2a88e69a2ef84d5c0';
const clientSecret = 'a99281438a8d4f079910563d416e4d3e';
const redirectUri = 'http://127.0.0.1:8888/callback';

const scopes = [
    'ugc-image-upload',
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

const SpotifyAPI = (function() {

    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic ' + btoa( clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        console.log("Token: " + data.access_token);
        return data.access_token;
    }

    const _getSong = async (token, songId) => {
        try {
            const result = await fetch(`https://api.spotify.com/v1/tracks/${songId}`, {
                method: "GET", headers: {Authorization: `Bearer ${token}`}
            });

            if(!result.ok) {
                throw new Error(`Result status: ${result.status}`);
            }

            const data = await result.json();
            return data;

        } catch (error) {
            console.error(error.message);
        }
    }

    const _getMe = async (token) => {
        try {
            const result = await fetch("https://api.spotify.com/v1/me", {
                method: "GET", headers: { Authorization: `Bearer ${token}` }
            });

            if(!result.ok) {
                console.log(Object.keys(result));
                throw new Error(`Result status: ${result.status}`);
            }

            const data = await result.json();
            console.log("Me data: " + data);
            return data;

        } catch (error) {
            console.error(error.message);
        }
    }

    return {
        getToken() {
            return _getToken();
        },
        getSong(token, songId) {
            return _getSong(token, songId);
        },
        getMe(token) {
            return _getMe(token);
        }
    }
})();

export {SpotifyAPI}