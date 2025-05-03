import {_authenticateSpotify} from "./RoutingCalls.js"


export async function register() {

  // 1. check whether user exists
  // 2. make user
  // 3. if successfull creation --> authenticate with spotify
  // 4. navigate to homepagefetch

  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;
  const response = await fetch("/v1/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  alert(data.message);
}

export async function login() {
  const username = document.getElementById("sign-in-username").value;
  const password = document.getElementById("sign-in-password").value;
  const response = await fetch("/v1/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
//   alert(data.message);


  if(response.status === 200) {
    window.location.replace(data.url);
  }

  if(response.status === 401) {
    alert("Incorrect username/password");
  }
}

document.getElementById("register-button").addEventListener("click", register);
document.getElementById("login-button").addEventListener("click", login);

// export default new AuthController;