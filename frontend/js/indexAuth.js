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
  
  // Validate inputs
  if (!username || !password) {
    alert('Please enter both username and password');
    return;
  }
  
  try {
    // Make an actual API call to verify credentials
    const response = await fetch("/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid credentials');
    }
    
    // After successful authentication, get the user data
    const userResponse = await fetch(`/v1/users/get/${username}`);
    if (!userResponse.ok) {
      throw new Error('Failed to get user data');
    }
    
    const userData = await userResponse.json();
    const user = userData.user || userData;
    
    // Store user data in localStorage (without password)
    delete user.password;
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('User logged in successfully:', user);
    
    // Redirect to home page by switching view
    if (typeof switchView === 'function') {
      switchView('home');
    } else {
      // Fall back to URL parameter if switchView isn't available
      window.location.href = '?view=home';
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('Login failed: ' + (error.message || 'Please try again'));
  }
}

document.getElementById("register-button").addEventListener("click", register);
document.getElementById("login-button").addEventListener("click", login);

// export default new AuthController;