// import {_authenticateSpotify} from "./RoutingCalls.js"


// class AuthController {
//   constructor () {

//   }

// async function register() {

//   // 1. check whether user exists
//   // 2. make user
//   // 3. if successfull creation --> authenticate with spotify
//   // 4. navigate to homepagefetch

//   const username = document.getElementById("register-username").value;
//   const password = document.getElementById("register-password").value;
//   const response = await ("/v1/register", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ username, password }),
//   });
//   const data = await response.json();
//   console.log(JSON.stringify(data, null, 2));
//   alert(data.message);
// }

// async function login() {
//   const username = document.getElementById("sign-in-username").value;
//   const password = document.getElementById("sign-in-password").value;
//   const response = await fetch("/v1/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ username, password }),
//   });
//   const data = await response.json();
//   console.log(JSON.stringify(data, null, 2));
//   alert(data.message);

//   if(data.status === 200) {
//     _authenticateSpotify();
//   }
// }

// document.getElementById("register-button").addEventListener("click", register);
// document.getElementById("login-button").addEventListener("click", login);

// }

// export default new AuthController;