/**
 * auth-utils.js - Authentication utility functions
 */

// Direct authentication state flag
let justAuthenticated = false;

// Check if user is authenticated
function isAuthenticated() {
    // First check the direct flag for immediate login actions
    if (justAuthenticated) {
        console.log("Just authenticated flag is true, user is authenticated");
        return true;
    }
    
    // Then check localStorage
    const userStr = localStorage.getItem('currentUser');
    console.log("Checking localStorage authentication:", userStr !== null);
    return userStr !== null;
}

// Ensure user is authenticated or redirect to auth view
function requireAuth(targetView) {
    // If trying to access the auth view, always allow
    if (targetView === 'auth') {
        return true;
    }
    
    // For any other view, check authentication
    if (!isAuthenticated()) {
        console.log('Authentication required. Redirecting to auth view.');
        // Return false to indicate authentication failed
        return false;
    }
    
    // Authentication passed
    return true;
}

// Redirect to auth if not authenticated
function redirectToAuthIfNeeded(targetView) {
    // If we're already on auth view or this is right after login, don't redirect
    if (targetView === 'auth' || justAuthenticated) {
        return false; // No redirection needed
    }
    
    if (!requireAuth(targetView)) {
        // If view switching is handled by URL
        window.location.href = '?view=auth';
        return true; // Redirection happened
    }
    return false; // No redirection needed
}

// Handle login and redirect to profile view on success
async function loginUser(username, password) {
    try {
        // Validate inputs
        if (!username || !password) {
            throw new Error('Please enter both username and password');
        }
        
        // Make API call to verify credentials
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
        
        // Set direct authentication flag
        justAuthenticated = true;
        
        // Use a short timeout to ensure localStorage is updated before redirecting
        setTimeout(() => {
            // Redirect to profile view 
            if (typeof switchView === 'function') {
                console.log("Switching view with skipAuthCheck = true");
                switchView('profile', true); // Skip auth check since we just authenticated
            } else {
                console.log("No switchView function found, using URL redirect");
                window.location.href = '?view=profile';
            }
        }, 100); // Short delay to ensure state is updated
        
        return true; // Login successful
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed: ' + (error.message || 'Please try again'));
        return false;
    }
}

// Export functions
window.authUtils = {
    isAuthenticated,
    requireAuth,
    redirectToAuthIfNeeded,
    loginUser,
    // Keep reference to authentication state for debugging
    getAuthState: () => ({ justAuthenticated, hasLocalStorage: localStorage.getItem('currentUser') !== null })
};

// Dispatch an event to notify that auth-utils has been loaded
document.dispatchEvent(new Event('auth-utils-loaded'));

// Log initialization
console.log("Auth utilities initialized");

// Force authentication check on page load
document.addEventListener('DOMContentLoaded', () => {
    const currentView = new URLSearchParams(window.location.search).get('view') || 'auth';
    if (currentView !== 'auth' && !isAuthenticated()) {
        console.log("Initial auth check: User not authenticated, will redirect to auth view");
        if (typeof switchView === 'function') {
            switchView('auth', true);
        } else {
            window.location.href = '?view=auth';
        }
    } else {
        console.log("Initial auth check: Authentication status:", isAuthenticated());
    }
});
