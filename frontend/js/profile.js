/**
 * profile.js - Handles user profile functionality
 * Manages autobio display and editing functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initProfileFunctionality();
});

// Make init function available to views.js to call when switching views
window.initProfileFunctionality = initProfileFunctionality;

function initProfileFunctionality() {
    console.log("Initializing profile functionality...");
    
    // Get references to autobio elements
    const autobioDisplay = document.getElementById('autobio-display');
    const autobioEditContainer = document.getElementById('autobio-edit-container');
    const autobioInput = document.getElementById('autobio-input');
    const editAutobioBtn = document.getElementById('edit-autobio');
    const saveAutobioBtn = document.getElementById('save-autobio');
    const cancelAutobioBtn = document.getElementById('cancel-autobio');

    console.log("Edit Bio button found:", editAutobioBtn);
    
    // Store current user info
    let currentUser = null;

    // Initialize profile page
    initProfile();

    // Add event listeners for autobio functionality
    if (editAutobioBtn) {
        console.log("Adding click event listener to Edit Bio button");
        editAutobioBtn.addEventListener('click', function(e) {
            console.log("Edit Bio button clicked");
            e.preventDefault();
            showEditAutobio();
        });
    }
    
    if (saveAutobioBtn) {
        saveAutobioBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveAutobio();
        });
    }
    
    if (cancelAutobioBtn) {
        cancelAutobioBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideEditAutobio();
        });
    }

    /**
     * Initialize the profile page with user data
     */
    async function initProfile() {
        try {
            // Get current user info from localStorage
            const userStr = localStorage.getItem('currentUser');
            
            if (!userStr) {
                console.error('No user logged in');
                return;
            }
            
            currentUser = JSON.parse(userStr);
            
            // Update display name
            const displayNameEl = document.getElementById('display-name');
            if (displayNameEl) {
                displayNameEl.textContent = `@${currentUser.username}`;
            }

            // Load user profile data including autobio
            await loadUserProfile(currentUser.username);
            
        } catch (error) {
            console.error('Error initializing profile:', error);
        }
    }

    /**
     * Load user profile data from the server
     * @param {string} username - The username to load data for
     */
    async function loadUserProfile(username) {
        try {
            // Update the API endpoint path to include the /v1 prefix to match other endpoints
            const response = await fetch(`/v1/users/get/${username}`);
            
            if (!response.ok) {
                throw new Error('Failed to load user profile');
            }
            
            const data = await response.json();
            console.log("User profile data received:", data);
            
            // Update profile with retrieved data
            updateProfileDisplay(data.user || data);

        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    /**
     * Update the profile display with user data
     * @param {Object} user - The user data object
     */
    function updateProfileDisplay(user) {
        if (!autobioDisplay) return;
        
        // Update autobio display
        if (user.autobio) {
            autobioDisplay.textContent = user.autobio;
        } else {
            autobioDisplay.innerHTML = '<em>No bio yet. Click "Edit Bio" to add one!</em>';
        }
        
        // Update profile picture if available
        if (user.pfp) {
            const profilePic = document.getElementById('profile-pic');
            if (profilePic) {
                profilePic.src = user.pfp;
            }
        }
        
        // Store current user data
        currentUser = user;
    }

    /**
     * Show the autobio edit form
     */
    function showEditAutobio() {
        if (!autobioDisplay || !autobioEditContainer || !editAutobioBtn || !autobioInput) {
            console.error("Required DOM elements not found for editing autobio");
            return;
        }
        
        if (!currentUser) {
            console.error("No user data available. Please try refreshing the page.");
            showNotification("Could not edit bio. Please try refreshing the page.", "error");
            return;
        }
        
        console.log("Showing edit autobio form for user:", currentUser.username);
        
        // Set current value in the textarea
        autobioInput.value = currentUser.autobio || '';
        
        // Show edit form, hide display and edit button
        autobioDisplay.style.display = 'none';
        autobioEditContainer.style.display = 'block';
        editAutobioBtn.style.display = 'none';
    }

    /**
     * Hide the autobio edit form
     */
    function hideEditAutobio() {
        if (!autobioDisplay || !autobioEditContainer || !editAutobioBtn) return;
        
        // Hide edit form, show display and edit button
        autobioDisplay.style.display = 'block';
        autobioEditContainer.style.display = 'none';
        editAutobioBtn.style.display = 'block';
    }

    /**
     * Save the autobio to the server
     */
    async function saveAutobio() {
        if (!autobioInput || !currentUser) return;
        
        const newAutobio = autobioInput.value.trim();
        
        try {
            console.log("Saving autobio:", newAutobio);
            
            // Update the user object with new autobio
            const userToUpdate = {
                id: currentUser.username, // Backend controller checks for 'id', but uses username as value
                username: currentUser.username, // Still include username for the model
                autobio: newAutobio
            };
            
            // The API endpoint is correct, just need to fix the request format
            const response = await fetch('/v1/users/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user: userToUpdate })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save autobio');
            }
            
            // Update local user data
            currentUser.autobio = newAutobio;
            
            // Update localStorage to include autobio
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update display
            if (autobioDisplay) {
                autobioDisplay.textContent = newAutobio || 'No bio yet. Click "Edit Bio" to add one!';
            }
            
            // Hide edit form
            hideEditAutobio();
            
            // Show success message
            showNotification('Bio updated successfully!');
            
        } catch (error) {
            console.error('Error saving autobio:', error);
            showNotification('Failed to save bio. Please try again.', 'error');
        }
    }
    
    /**
     * Show a notification to the user
     * @param {string} message - The message to display
     * @param {string} type - The type of notification (success, error)
     */
    function showNotification(message, type = 'success') {
        // Check if notification container exists
        let notification = document.querySelector('.notification');
        
        // Create if it doesn't exist
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // Set notification properties
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        // Show notification
        notification.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}