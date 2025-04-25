// 🎵 Mock list of 10 random songs
const mockTracks = [
    "Leave The Door Open - Bruno Mars",
    "Blinding Lights - The Weeknd",
    "Peaches - Justin Bieber",
    "Watermelon Sugar - Harry Styles",
    "Levitating - Dua Lipa",
    "Shivers - Ed Sheeran",
    "good 4 u - Olivia Rodrigo",
    "As It Was - Harry Styles",
    "Stay - The Kid LAROI & Justin Bieber",
    "Uptown Funk - Mark Ronson ft. Bruno Mars"
];

// CREATE
export async function createPlaylist(name, seedGenre = "pop", trackLimit = 10) {
    try {
        const response = await fetch('/spotify/auto-create-playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, seedGenre, trackLimit })
        });

        if (!response.ok) throw new Error('Failed to create playlist');

        const data = await response.json();
        console.log('Playlist created:', data.playlistUrl);

        // Add mock tracks for display
        data.tracks = mockTracks;

        // Display in page
        displayPlaylist(data);

        return data.playlistUrl;
    } catch (error) {
        console.error('Error creating playlist:', error);
        throw error;
    }
}

// Display playlist info directly in the page
function displayPlaylist(data) {
    const playlistDiv = document.getElementById("playlist");

    playlistDiv.innerHTML = `
        <h3>🎵 Playlist Created</h3>
        <ul>
            <li><strong>Name:</strong> ${data.name}</li>
            <li><strong>Genre:</strong> ${data.seedGenre}</li>
            <li><strong>Track Limit:</strong> ${data.trackLimit}</li>
            <li><strong>URL:</strong> <a href="${data.playlistUrl}" target="_blank">${data.playlistUrl}</a></li>
        </ul>
        <h4>🎧 Track List:</h4>
        <ol>${data.tracks.map(track => `<li>${track}</li>`).join('')}</ol>
    `;
}

// READ
export async function getPlaylist(playlistId) {
    try {
        const response = await fetch(`/spotify/playlist/${playlistId}`);
        if (!response.ok) throw new Error('Failed to fetch playlist');

        const data = await response.json();
        console.log('Fetched playlist:', data);

        return data;
    } catch (error) {
        console.error('Error fetching playlist:', error);
        throw error;
    }
}

// UPDATE
export async function addTrackToPlaylist(playlistId, trackId) {
    try {
        const response = await fetch('/spotify/add-track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlist_id: playlistId, track_id: trackId })
        });

        if (!response.ok) throw new Error('Failed to add track');

        const data = await response.json();
        console.log('Track added to playlist:', data);

        return data;
    } catch (error) {
        console.error('Error adding track:', error);
        throw error;
    }
}

// DELETE
export async function removeTrackFromPlaylist(playlistId, trackUri) {
    try {
        const response = await fetch('/spotify/remove-track', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlist_id: playlistId, track_uri: trackUri })
        });

        if (!response.ok) throw new Error('Failed to remove track');

        const data = await response.json();
        console.log('Track removed from playlist:', data);

        return data;
    } catch (error) {
        console.error('Error removing track:', error);
        throw error;
    }
}

// DOM Event
document.addEventListener('DOMContentLoaded', () => {
    const createButton = document.getElementById("createPlaylistButton");
    createButton.addEventListener("click", async () => {
        const playlistName = "Bruno Mars Fanclub Playlist";
        const seedGenre = "pop";
        const trackLimit = 10;

        try {
            const playlistData = await createPlaylist(playlistName, seedGenre, trackLimit);
        } catch (error) {
            alert('Failed to create playlist');
        }
    });
});
