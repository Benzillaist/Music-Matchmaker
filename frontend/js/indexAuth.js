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
  
  try {
    // Create mock user data instead of making actual API call
    const mockUserData = {
      username: username || 'demo_user',
      pfp: 'images/default-pfp.png',
      autobio: 'This is a sample bio for the demo user. Edit this to customize your profile!',
      id: username || 'demo_user'
    };
    
    // Store mock user data in localStorage
    localStorage.setItem('currentUser', JSON.stringify(mockUserData));
    console.log('User data stored in localStorage:', mockUserData);
    
    // Redirect to home page by switching view
    if (typeof switchView === 'function') {
      switchView('home');
    } else {
      // Fall back to URL parameter if switchView isn't available
      window.location.href = '?view=home';
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('Login failed. Please try again.');
  }
}

document.getElementById("register-button").addEventListener("click", register);
document.getElementById("login-button").addEventListener("click", login);

// export default new AuthController;