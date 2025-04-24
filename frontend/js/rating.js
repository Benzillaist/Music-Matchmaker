import {SpotifyAPI} from "./spotify-api.js"
import {DB} from "./indexedDB.js";

document.addEventListener("DOMContentLoaded", async () => {
    const ratingBox = document.getElementById("ratings-box");

    // Get Spotify API token and save to Spotify DB
    var SpotifyDB = new DB("test");
    SpotifyDB.saveData("token", await SpotifyAPI.getToken());

    // // Create UserDB
    var UserDB = new DB("Users");

    // Load in fake data file that incldues the user ID and top songs
    var user_id;
    var song_ids;
    async function loadFakeData() {
        const fetch_json = await fetch("fake_data/users.json");
        const fake_data = await fetch_json.json();
        user_id = fake_data.user1.id;
        song_ids = fake_data.user1.top_songs;
    }
    // const user_id = "43gj8934hvg782y-v39ygw8yf9gm7";
    // const song_ids = ["5C8ySsx3AT121g24uYR823", "2wqxcctWptasX4VnP2sRvV", "6QTGiIuNopQu1iV2aa0fDS", "3E7ZwUMJFqpsDOJzEkBrQ7", "5Ohlkv2NY6pOC9sHZMsUPV"];



    let rating_num = 0;

    async function assembleRatings(song_id) {
        let song_box = document.createElement("div");
        let song_name = document.createElement("div");
        let star_box = document.createElement("div");

        let token = await SpotifyDB.getData("token");

        const song_data = await SpotifyAPI.getSong(await SpotifyDB.getData("token"), song_id);
        const artists = song_data.artists.map((artist) => artist.name).join(", ");

        song_box.setAttribute("id", `r${rating_num}`);
        song_name.innerText = song_data.name + " By " + artists;

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
            star.addEventListener("click", (event) => {
                const target_id = Number(event.target.id[1]);
                const star_num = Number(event.target.id[4]) + 1;

                // Update indexedDB
                UserDB.saveData(song_ids[target_id], star_num);

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

    main();
});