const clientId = '1898c3c834e04da2a88e69a2ef84d5c0';
const clientSecret = 'a99281438a8d4f079910563d416e4d3e';
const redirectUri = 'http://127.0.0.1:8888/callback';

const SpotifyAPI = (function() {

    const clientId = '1898c3c834e04da2a88e69a2ef84d5c0';
    const clientSecret = 'a99281438a8d4f079910563d416e4d3e';

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
        return data.access_token;
    }

    const _getSong = async (token, songId) => {
        try {
            const result = await fetch(`https://api.spotify.com/v1/search?q=eminem&type=album`, {
                method: "GET", headers: {'Authorization': `Bearer ${token}`}  
            });

            if(!result.ok) {
                throw new Error(`Result status: ${result.status}`);
            }

            console.log(result.status);

            const data = await result.json();
            return data.items;

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
    }
})();

// console.log(await getToken());
async function main() {
    const token = await SpotifyAPI.getToken();
    console.log("Token: " + token);
    const song_info = await SpotifyAPI.getSong(token, "11dFghVXANMlKmJXsNCbNl");
    console.log("Song info: " + song_info);
}

main();