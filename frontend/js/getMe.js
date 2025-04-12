const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
const token = "BQAy-eSM7Z1duNkuH9JAbcuLwAQ0ailyzP9VmdYsXK6zHg8lF0Ibzo0HgaqpVoQerOnMUW0vmPp1IUc_51sHqsPCUO8xlFaealAFP7aQawKrl0jci9vcYUqtPlCFua5mofro4obPLs4Q6QFoxWIOCwFM6WNGZP28sZtNMUB5F7DGHzjtquj5mXm69r_4cnKQiHJp7fIcbnfmNshIkaUDGnfVlk90WtjLJ5AoKO7zBBo8e67flmo8f8v92Jb5QLzP0JQxw4GAlTJqe7GjS86DWUPLmJpC8vno4sdla_IXafAG_fMxZ1hhsCeC0ua_Q-0eV8ywvSHyf57rdbUD6m3lM1ZPRCEWNli-hG49u_SDvJMG365ykF7MjNIJ";

const spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(token);

//GET MY PROFILE DATA
function getMyData() {
  (async () => {
    const me = await spotifyApi.getMe();
    // console.log(me.body);
    getUserPlaylists(me.body.id);
  })().catch(e => {
    console.error(e);
  });
}

//GET MY PLAYLISTS
async function getUserPlaylists(userName) {
  const data = await spotifyApi.getUserPlaylists(userName)

  console.log("---------------+++++++++++++++++++++++++")
  let playlists = []

  for (let playlist of data.body.items) {
    console.log(playlist.name + " " + playlist.id)
    
    let tracks = await getPlaylistTracks(playlist.id, playlist.name);
    // console.log(tracks);

    const tracksJSON = { tracks }
    let data = JSON.stringify(tracksJSON);
    fs.writeFileSync(playlist.name+'.json', data);
  }
}

//GET SONGS FROM PLAYLIST
async function getPlaylistTracks(playlistId, playlistName) {

  const data = await spotifyApi.getPlaylistTracks(playlistId, {
    offset: 1,
    limit: 100,
    fields: 'items'
  })

  // console.log('The playlist contains these tracks', data.body);
  // console.log('The playlist contains these tracks: ', data.body.items[0].track);
  // console.log("'" + playlistName + "'" + ' contains these tracks:');
  let tracks = [];

  for (let track_obj of data.body.items) {
    const track = track_obj.track
    tracks.push(track);
    console.log(track.name + " : " + track.artists[0].name)
  }
  
  console.log("---------------+++++++++++++++++++++++++")
  return tracks;
}

getMyData();