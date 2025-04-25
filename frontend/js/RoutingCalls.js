export async function _createGroup(groupname, user_ids) {

    const new_playlist = await _createPlaylist(`${groupname}\'s playlist`);

    const playlist_json = JSON.stringify({
        "groupname": groupname,
        "user_ids": user_ids,
        "playlist_id": new_playlist.id
    });

    const new_group_request = await fetch(`/v1/groups/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: playlist_json,
    });

    if(new_group_request.status === 404) {
        // document.getElementById("create-group-info").innerHTML = "Error creating group";
        return;
    }

    if(new_group_request.status === 201) {
        const group_info = await new_group_request.json();
        // document.getElementById("create-group-info").innerHTML = JSON.stringify(group_info);
        return group_info;
    }
}

export async function _updateGroup(group) {
    console.log(`group: ${group}`);
    console.log(`group key: ${Object.keys(group)}`);
    console.log(`group id: ${group.id}`);
    const update_group_request = await fetch(`/v1/groups/update`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(group),
    })

    if(update_group_request.status === 404) {
        // document.getElementById("create-group-info").innerHTML = "Error creating group";
        return;
    }

    if(update_group_request.status === 200) {
        const group_info = await update_group_request.json();
        // document.getElementById("create-group-info").innerHTML = JSON.stringify(group_info);
        return group_info;
    }
}

export async function _topTracks() {
    const top_tracks_request = await fetch(`/v1/toptracks`);

    if(top_tracks_request.status === 404) {
        // document.getElementById("top-tracks-info").innerHTML = "Error fetching user's top tracks";
        return;
    }

    if(top_tracks_request.status === 200) {
        const top_tracks_info = await top_tracks_request.json();
        // document.getElementById("top-tracks-info").innerHTML = JSON.stringify(top_tracks_info.body.items);
        return top_tracks_info.body.items;
    }
}

export async function _addTrack(playlist_id, track_id) {

    const add_track_json = JSON.stringify({
        "playlist_id": playlist_id,
        "track_id": track_id
    });


    const addRequest = await fetch(`/v1/playlist/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: add_track_json,
    });

    if(addRequest.status === 400) {
        // document.getElementById("add-track-info").innerHTML = "Error accessing playlist's details";
    }

    if(addRequest.status === 200) {
        const add_info = await addRequest.json();
        
        // document.getElementById("add-track-info").innerHTML = `
        // <iframe style="border-radius:12px" 
        // src="https://open.spotify.com/embed/playlist/${playlist_id}?utm_source=generator&theme=0" 
        // width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; 
        // clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        // loading="lazy"></iframe>
        // `
    }
}

export async function _authenticateSpotify() {
    const authRequest = await fetch(`/v1/spotifyAuth`).then((url) => {
        return url.json()});
    const authUrl = authRequest.url;
    window.location.replace(authUrl);
}

export async function _getMe() {
    const user = await fetch(`/v1/getme`);

    if(user.status === 404) {
        // document.getElementById("spotify-info").innerHTML = "Error accessing user's details";
    }

    if(user.status === 200) {
        const userInfo = await user.json();
        // document.getElementById("spotify-info").innerHTML = JSON.stringify(userInfo);
        return userInfo.body;
    }
}

export async function _getGroups() {
    const groups_request = await fetch(`/v1/groups/getall`);

    if(groups_request.status === 404) {
        // document.getElementById("groups-info").innerHTML = "Error fetching all groups";
        return;
    }

    if(groups_request.status === 200) {
        const group_info = await groups_request.json();
        // document.getElementById("groups-info").innerHTML = JSON.stringify(group_info.groups);
        return group_info.groups;
    }
}

export async function _findTrack(song_id) {

    const trackRequest = await fetch(`/v1/track/get/${song_id}`);

    if(trackRequest.status === 400) {
        // document.getElementById("track-info").innerHTML = "Error accessing track's details";
    }

    if(trackRequest.status === 200) {
        const trackInfo = await trackRequest.json();
        // document.getElementById("track-info").innerHTML = JSON.stringify(trackInfo);
        return trackInfo.body;
    }
}

export async function _findArtist(artist_id) {
    const artistRequest = await fetch(`/v1/artist/get/${artist_id}`);

    if(artistRequest.status === 400) {
        // document.getElementById("artist-info").innerHTML = "Error accessing artist's details";
    }

    if(artistRequest.status === 200) {
        const artistInfo = await artistRequest.json();
        // document.getElementById("artist-info").innerHTML = JSON.stringify(artistInfo);
        return artistInfo.body;
    }
}

export async function _findPlaylist() {
    var playlist_id = document.getElementById("playlist-id").value;

    const playlistRequest = await fetch(`/v1/playlist/get/${playlist_id}`);

    if(playlistRequest.status === 400) {
        // document.getElementById("playlist-info").innerHTML = "Error accessing playlist's details";
    }

    if(playlistRequest.status === 200) {
        const playlistInfo = await playlistRequest.json();
        // document.getElementById("playlist-info").innerHTML = JSON.stringify(playlistInfo);
        return playlistInfo.body;
    }
}

export async function _createPlaylist(playlist_name) {
    const playlistRequest = await fetch(`/v1/playlist/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({"name": playlist_name}),
    });

    if(playlistRequest.status === 400) {
        // document.getElementById("new-playlist-info").innerHTML = "Error accessing playlist's details";
    }

    if(playlistRequest.status === 200) {
        const playlistInfo = await playlistRequest.json();
        const playlist_id = playlistInfo.body.id;

        // document.getElementById("playlist-info").innerHTML = JSON.stringify(playlistInfo);
        
        // document.getElementById("new-playlist-info").innerHTML = `
        // <iframe style="border-radius:12px" 
        // src="https://open.spotify.com/embed/playlist/${playlist_id}?utm_source=generator&theme=0" 
        // width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; 
        // clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        // loading="lazy"></iframe>
        // `

        return playlistInfo.body;
    }
}