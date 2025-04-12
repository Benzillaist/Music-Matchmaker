// import {getSpotifyApi} from "./spotify-api.js"

document.addEventListener("DOMContentLoaded", () => {
    const ratingBox = document.getElementById("ratings-box");

    // Get Spotify API token

    var spotifyApi = getSpotifyApi();

    console.log(spotifyApi);

    let db;
    const DATABASE_NAME = "musicMatchmakerRatings";
    const STORE_NAME = "ratings";

    const ratings = [1, 2, 3, 4, 5];

    let rating_num = 0;

    function assembleRatings(song_id) {
        let song_box = document.createElement("div");
        let song_name = document.createElement("div");
        let star_box = document.createElement("div");

        for(let i = 0; i < 5; i++) {
            let star = document.createElement("span");
            star.classList.add("fa");
            star.classList.add("fa-star");
            star.classList.add("star");
            star.setAttribute("id", `r${rating_num}-s${i}`);
            star.addEventListener("mouseover", (event) => {
                // let obj_id = event.target.id;
                // let rating_box_number = Number(obj_id[1]);
                // let star_number = Number(obj_id[4]);
                for(let j = i; j >= 0; j--) {
                    document.getElementById(`r${rating_num}-s${j}`).color = "#F8CA00";
                }
            });
            star.addEventListener("mouseout", (event) => {
                for(let j = i; j >= 0; j--) {
                    document.getElementById(`r${rating_num}-s${j}`).color = "#000000";
                }
            });
            star.addEventListener("onclick", (event) => {

            });
        }
        song_box.classList.add("song-info");
        song_box.classList.add("white");
        song_box.classList.add("h3");

        rating_num += 1;



        // "<div class="song vcontainer margin2">
        //       <div class="song-info white h3">
        //         Don't Stop Believing by Journey
        //       </div>
        //       <div class="rating-stars hcontainer">
        //         <span class="fa fa-star star"></span>
        //         <span class="fa fa-star star"></span>
        //         <span class="fa fa-star star"></span>
        //         <span class="fa fa-star star"></span>
        //         <span class="fa fa-star star"></span>
        //       </div>
        //     </div>
    }

    function initDB() {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open(DATABASE_NAME, )

                request.onsuccess = (event) => {
                    console.log(`The ${DATABASE_NAME} IndexedDB was successfully initialized!`)
                    resolve(event.target.result);
                };

                request.onerror = (event) => {
                    console.log(`The following error was encountered while making the ${DATABASE_NAME} database: ${event}`);
                    reject(event.target.error);
                };
            } catch(error) {
                console.log(`The following critical error occurred while initializing the ${DATABASE_NAME} database: ${error}`);
                reject(error);
            }
        });
    }

    async function init() {

    }
});