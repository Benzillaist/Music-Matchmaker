import {_authenticateSpotify, _topTracks, _createGroup, _addTrack, _findTrack, _updateGroup, _getGroups} from "./RoutingCalls.js"



document.addEventListener("DOMContentLoaded", async () => {

    function switchView(viewName) {
        // Check if we have that view in the current page
        const viewElement = document.getElementById(`${viewName}-view`);
        
        // If view doesn't exist in current page, navigate to the corresponding file
        if (!viewElement) {
          window.location.href = viewToFileMap[viewName] + `?view=${viewName}`;
          return;
        }
        
        // Otherwise, switch views within the current page
        
        // Hide all views
        const views = document.querySelectorAll('.view-content');
        views.forEach(view => {
          view.style.display = 'none';
        });
        
        // Show the selected view
        viewElement.style.display = 'block';
        
        // Update current view
        currentView = viewName;
        
        // Update URL without reloading the page (for browser history)
        history.pushState({ view: viewName }, '', `?view=${viewName}`);
        
        // Apply specific class to body to help with view-specific styling
        document.body.className = 'color2';  // Reset to base class
        document.body.classList.add(`${viewName}-active`); // Add view-specific class
        
        // Ensure content area is visible
        const contentArea = document.getElementById('view-container');
        if (contentArea) {
          contentArea.style.display = 'block';
        }
    }

    async function authenticateSpotify() {
        console.log("Test");
        await _authenticateSpotify();
    }

    async function loadGroupPage() {
        main();
    }

    const groupPageButton = document.getElementById("group-page-button");
    // const authButton = document.getElementById("auth-button");
    // authButton.addEventListener("click", authenticateSpotify);
    groupPageButton.addEventListener("click", loadGroupPage);

    // document.getElementById('auth-button').onclick = await _authenticateSpotify();


    // const ratingBox = document.getElementById("ratings-box");


    var user_id;
    var group;
    var song_ids = [];
    async function loadFakeData() {
        const fetch_json = await fetch("fake_data/users.json");
        const fake_data = await fetch_json.json();
        user_id = fake_data.user1.id;

        group = await _createGroup("Fake group", [user_id]);

        const top_songs = await _topTracks();
        for(let i = 0; i < Math.min(top_songs.length, 5); i++) {
            song_ids.push(top_songs[i].id);
        }

        setTimeout(() => {
            document.getElementById("playlist").innerHTML = `
            <iframe class="margin5" style="border-radius:12px" 
            src="https://open.spotify.com/embed/playlist/${group.playlist_id}?utm_source=generator&theme=0" 
            width="90%" height="600" frameBorder="0" allowfullscreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"></iframe>
            `;
        }, 100);
    }

    // const user_id = "43gj8934hvg782y-v39ygw8yf9gm7";
    // const song_ids = ["5C8ySsx3AT121g24uYR823", "2wqxcctWptasX4VnP2sRvV", "6QTGiIuNopQu1iV2aa0fDS", "3E7ZwUMJFqpsDOJzEkBrQ7", "5Ohlkv2NY6pOC9sHZMsUPV"];

    let rating_num = 0;

    async function assembleRatings(song_id) {
        let song_box = document.createElement("div");
        let song_name = document.createElement("div");
        let star_box = document.createElement("div");

        // Group stuff
        group.ratings.push({
            "id": song_id,
            "n_votes": 0,
            "total_rating": 0
        });
        _updateGroup(group);

        const track_data = await _findTrack(song_id);
        const artists = track_data.artists.map((artist) => artist.name).join(", ")

        // const song_data = await SpotifyAPI.getSong(await SpotifyDB.getData("token"), song_id);
        // const artists = track_data.artists.map((artist) => artist.name).join(", ");

        song_box.setAttribute("id", `r${rating_num}`);
        song_name.innerText = track_data.name + " By " + artists;

        for(let i = 0; i < 5; i++) {
            let star = document.createElement("span");
            star.classList.add("fa");
            star.classList.add("fa-star");
            star.classList.add("star");
            star.setAttribute("id", `r${rating_num}-s${i}`);
            star.addEventListener("mouseover", (event) => {
                const target_id = Number(event.target.id[1]);
                for(let j = i; j >= 0; j--) {
                    document.getElementById(`r${target_id}-s${j}`).classList.add("yellow");
                }
            });
            star.addEventListener("mouseout", (event) => {
                const target_id = Number(event.target.id[1]);
                for(let j = i; j >= 0; j--) {
                    document.getElementById(`r${target_id}-s${j}`).classList.remove("yellow");
                }
            });
            star.addEventListener("click", async (event) => {
                const target_id = Number(event.target.id[1]);
                const star_num = Number(event.target.id[4]) + 1;

                // Group / playlist management

                const track_index = group.ratings.findIndex((r) => r.id === song_id);

                group.ratings[track_index].n_votes = group.ratings[track_index].n_votes + 1;
                group.ratings[track_index].total_rating = group.ratings[track_index].total_rating + star_num;

                _updateGroup(group);

                if((group.ratings[track_index].total_rating / group.ratings[track_index].n_votes) >= 4) {
                    _addTrack(group.playlist_id, song_id);
                }

                setTimeout(() => {
                    document.getElementById("playlist").innerHTML = `
                    <iframe class="margin5" style="border-radius:12px" 
                    src="https://open.spotify.com/embed/playlist/${group.playlist_id}?utm_source=generator&theme=0" 
                    width="90%" height="600" frameBorder="0" allowfullscreen="" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"></iframe>
                    `;
                }, 100);

                // // Update indexedDB
                // UserDB.saveData(song_id[target_id], star_num);

                // Remove event listeners
                for(let j = 0; j < 5; j++) {
                    var old_star = document.getElementById(`r${target_id}-s${j}`);
                    var new_star = old_star.cloneNode(true);
                    old_star.parentNode.replaceChild(new_star, old_star);
                }

                // Wait for a second, then hide
                setTimeout(() => {
                    document.getElementById('ratings-box').removeChild(document.getElementById(`r${target_id}`));
                    // style.visibility = "hidden";
                }, 1000);
            });
            star_box.appendChild(star);
        }
        song_box.classList.add("song", "vcontainer", "margin2");
        song_name.classList.add("song-info", "white", "h3");
        star_box.classList.add("rating-stars", "hcontainer");

        song_box.appendChild(song_name);
        song_box.appendChild(star_box);

        rating_num += 1;

        return song_box;
    }

    async function addSongRatings() {
        for(let i = 0; i < song_ids.length; i++) {
            const ratingBox = await assembleRatings(song_ids[i]);
            document.getElementById('ratings-box').appendChild(ratingBox);
        }
    }

    async function main() {
        await loadFakeData();

        await addSongRatings();
    }
});