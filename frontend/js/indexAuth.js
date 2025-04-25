import {_authenticateSpotify} from "./RoutingCalls.js"

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById('auth-button').onclick = _authenticateSpotify();
});