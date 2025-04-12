/**
 * views.js - Handles view switching for Music Matchmaker
 * This enables a single-page application experience without page reloads
 */

// Store current view state
let currentView = 'home'; // Default view for index.html

// Maps view names to their respective HTML files for fallback navigation
const viewToFileMap = {
  'home': 'index.html',
  'listen': 'listen.html',
  'groups': 'groups.html',
  'profile': 'profile.html'
};

/**
 * Switch between different views
 * @param {string} viewName - Name of the view to switch to
 */
function switchView(viewName) {
  // Check if we have that view in the current page
  const viewElement = document.getElementById(`${viewName}-view`);
  
  // If view doesn't exist in current page, navigate to the corresponding file
  if (!viewElement) {
    window.location.href = viewToFileMap[viewName] + `?view=${viewName}`;
    return;
  }
  
  // Otherwise, switch views within the current page
  
  // Hide all views
  const views = document.querySelectorAll('.view-content');
  views.forEach(view => {
    view.style.display = 'none';
  });
  
  // Show the selected view
  viewElement.style.display = 'block';
  
  // Update current view
  currentView = viewName;
  
  // Update URL without reloading the page (for browser history)
  history.pushState({ view: viewName }, '', `?view=${viewName}`);
  
  // Apply specific class to body to help with view-specific styling
  document.body.className = 'color2';  // Reset to base class
  document.body.classList.add(`${viewName}-active`); // Add view-specific class
  
  // Ensure content area is visible
  const contentArea = document.getElementById('view-container');
  if (contentArea) {
    contentArea.style.display = 'block';
  }
}

/**
 * Handle browser back/forward navigation
 */
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.view) {
    switchView(event.state.view);
  } else {
    // Default to home if no state is available
    switchView('home');
  }
});

/**
 * Initialize the page based on URL parameters or default to a specific view
 */
function initializeView() {
  // Make sure all CSS is loaded before showing content
  ensureStylesLoaded();
  
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  
  // Determine the base page we're on by the filename
  const currentPath = window.location.pathname;
  const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1);
  
  // Set appropriate default view based on current page
  if (currentPage === 'index.html' || currentPage === '') {
    window.currentView = 'home';
  } else if (currentPage === 'listen.html') {
    window.currentView = 'listen';
  } else if (currentPage === 'groups.html') {
    window.currentView = 'groups';
  } else if (currentPage === 'profile.html') {
    window.currentView = 'profile';
  }
  
  // Use URL parameter if available, otherwise use default
  if (viewParam && document.getElementById(`${viewParam}-view`)) {
    switchView(viewParam);
  } else {
    // Default to the current page's main view
    switchView(window.currentView || 'home');
  }
}

/**
 * Ensure all styles are loaded before showing content
 */
function ensureStylesLoaded() {
  // Create a list of essential stylesheets
  const essentialStyles = [
    'main.css',
    'index.css',
    'listen.css',
    'groups.css',
    'responsive-helper.css',
    'js/chat.css'
  ];
  
  // Check if these styles are loaded, if not, load them
  essentialStyles.forEach(stylesheet => {
    if (!isStylesheetLoaded(stylesheet)) {
      loadStylesheet(stylesheet);
    }
  });
}

/**
 * Check if a stylesheet is already loaded
 * @param {string} href - The href/path of the stylesheet
 * @returns {boolean} - True if loaded, false otherwise
 */
function isStylesheetLoaded(href) {
  const links = document.getElementsByTagName('link');
  for (let i = 0; i < links.length; i++) {
    if (links[i].rel === 'stylesheet' && links[i].href.includes(href)) {
      return true;
    }
  }
  return false;
}

/**
 * Load a stylesheet dynamically
 * @param {string} href - The href/path of the stylesheet to load
 */
function loadStylesheet(href) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeView);

// Add cursor:pointer style to clickable navigation items
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.header-item.link');
  navLinks.forEach(link => {
    link.style.cursor = 'pointer';
  });
});