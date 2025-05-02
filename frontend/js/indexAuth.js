import {_authenticateSpotify} from "./RoutingCalls.js"


document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById('auth-button').onclick = register();
});

export async function register() {

    // 1. check whether user exists
    // 2. make user
    // 3. if successfull creation --> authenticate with spotify
    // 4. navigate to homepage
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const response = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    alert(data.message);
}