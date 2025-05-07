document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const chatMessagesContainer = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendMessageBtn = document.getElementById('send-message-btn');

  // Check if all required DOM elements exist
  if (!chatMessagesContainer || !chatInput || !sendMessageBtn) {
    console.error('Chat elements not found in the DOM. Chat functionality disabled.');
    return; // Exit early if elements don't exist
  }

  const currentUser = {
    id: 'user-' + Math.floor(Math.random() * 1000),
    name: 'Me'
  };

  // Sample usernames for received messages
  const otherUsers = [
    'John', 'Emma', 'Michael', 'Sophia', 'David'
  ];

  // IndexedDB setup
  let db;
  const DB_NAME = 'musicMatchmakerChat';
  const STORE_NAME = 'messages';
  
  // Backend API URL - adjust to match existing backend endpoints
  const API_URL = '/v1/chat'; // Change this to match your backend route pattern

  // Add connection status indicator
  const connectionStatus = document.createElement('div');
  connectionStatus.className = 'connection-status';
  connectionStatus.textContent = 'Connecting...';
  
  // Add to DOM when chat is ready
  setTimeout(() => {
    if (chatMessagesContainer && chatMessagesContainer.parentNode) {
      chatMessagesContainer.parentNode.appendChild(connectionStatus);
    }
  }, 100);

  // CRUD API Functions with proper endpoint paths
  // CREATE - Post message to API with correct path
  async function postMessageToAPI(message) {
    try {
      // Make sure we have all required fields for SQLite model
      if (!message.id) {
        message.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(message)
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      connectionStatus.textContent = 'Message sent';
      connectionStatus.classList.remove('offline');

      return await response.json();
    } catch (error) {
      console.error('Failed to post message to API:', error);
      connectionStatus.classList.add('offline');
      // If API fails, fall back to local storage
      await saveMessage(message);
      return message;
    }
  }

  // READ - Fetch messages from API with correct path
  async function fetchMessagesFromAPI() {
    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      connectionStatus.textContent = 'Connected';
      connectionStatus.classList.remove('offline');
      
      // Parse response - might contain SQLite model objects
      const data = await response.json();
      
      // Handle SQLite model structure if needed
      if (Array.isArray(data) && data.length > 0 && data[0].dataValues) {
        return data.map(item => item.dataValues || item);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch messages from API:', error);
      connectionStatus.classList.add('offline');
      // If API fails, fall back to local storage
      return getLocalMessages();
    }
  }

  // UPDATE - Update message in API with improved error handling and retry functionality
  async function updateMessageInAPI(id, updatedContent, retryCount = 0) {
    try {
      console.log(`Updating message ${id} in API, attempt: ${retryCount + 1}`);
      
      // First get the existing message to update
      const existingMessage = await fetchMessageById(id);
      
      if (!existingMessage) {
        throw new Error(`Message not found: ${id}`);
      }
      
      // Prepare update payload
      const updatePayload = {
        ...existingMessage,
        content: updatedContent,
        edited: true
      };
      
      // Add timestamp for when the edit occurred
      updatePayload.lastEditTimestamp = Date.now();
      
      console.log(`Sending update request for message ${id}:`, updatePayload);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });
      
      // Handle HTTP error status
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      connectionStatus.textContent = 'Message updated';
      connectionStatus.classList.remove('offline', 'error');

      // Parse response - might contain SQLite model object
      const responseData = await response.json();
      console.log(`Received update response:`, responseData);
      
      // Handle SQLite model structure if needed
      if (responseData && responseData.dataValues) {
        return responseData.dataValues;
      }
      
      return responseData;
    } catch (error) {
      console.error(`Failed to update message ${id} in API:`, error);
      connectionStatus.classList.add('error');
      
      // Implement retry logic (max 2 retries)
      if (retryCount < 2) {
        console.log(`Retrying update for message ${id}, attempt ${retryCount + 2}...`);
        // Wait a short time before retrying
        await new Promise(resolve => setTimeout(resolve, 800));
        return updateMessageInAPI(id, updatedContent, retryCount + 1);
      }
      
      return null;
    }
  }
  
  // Helper function to fetch a single message by ID
  async function fetchMessageById(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle SQLite model structure if needed
      if (data && data.dataValues) {
        return data.dataValues;
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch message ${id}:`, error);
      return null;
    }
  }

  // DELETE - Delete message from API with standardized URL pattern
  async function deleteMessageFromAPI(id) {
    try {
      // Fixed URL to match the pattern of other API calls
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      connectionStatus.textContent = 'Message deleted';

      return true;
    } catch (error) {
      console.error(`Failed to delete message ${id} from API:`, error);
      connectionStatus.classList.add('error');
      return false;
    }
  }

  // Initialize IndexedDB
  function initDB() {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          db = event.target.result;
          console.log('Database initialized successfully');
          resolve(db);
        };

        request.onerror = (event) => {
          console.error('Error initializing database:', event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error('Critical error during database initialization:', error);
        reject(error);
      }
    });
  }

  // Save message to IndexedDB
  function saveMessage(message) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(message);

        request.onsuccess = () => {
          console.log('Message saved successfully');
          resolve();
        };

        request.onerror = (event) => {
          console.error('Error saving message:', event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error('Error in saveMessage:', error);
        reject(error);
      }
    });
  }

  // Get messages from local IndexedDB (renamed from getRecentMessages for clarity)
  function getLocalMessages() {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        
        // Open a cursor to get the 5 most recent messages (sorted in descending order)
        const request = index.openCursor(null, 'prev');
        
        const messages = [];
        let count = 0;
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor && count < 5) {
            messages.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            // Reverse to get chronological order (oldest to newest)
            resolve(messages.reverse());
          }
        };
        
        request.onerror = (event) => {
          console.error('Error retrieving messages:', event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error('Error in getLocalMessages:', error);
        reject(error);
      }
    });
  }

  // Get recent messages (now tries API first, then falls back to local)
  async function getRecentMessages() {
    try {
      return await fetchMessagesFromAPI();
    } catch (error) {
      console.warn('Falling back to local messages:', error);
      return await getLocalMessages();
    }
  }

  // Create and display message element - updated to add edit/delete controls
  function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    // Make sure message has an ID property - crucial for edit/delete
    const messageId = message.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    messageDiv.dataset.messageId = messageId;
    
    // Add appropriate class based on sender
    if (message.userId === currentUser.id) {
      messageDiv.classList.add('message-self');
      
      // Add edit/delete controls for own messages
      const controlsElement = document.createElement('div');
      controlsElement.classList.add('message-controls');
      
      const editBtn = document.createElement('button');
      editBtn.classList.add('edit-btn');
      editBtn.innerHTML = '✏️';
      editBtn.title = 'Edit';
      editBtn.onclick = (e) => {
        e.stopPropagation();
        editMessage(messageId);
      };
      
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete-btn');
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.title = 'Delete';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteMessage(messageId);
      };
      
      controlsElement.appendChild(editBtn);
      controlsElement.appendChild(deleteBtn);
      messageDiv.appendChild(controlsElement);
    } else {
      messageDiv.classList.add('message-others');
    }
    
    const senderElement = document.createElement('div');
    senderElement.classList.add('sender');
    senderElement.textContent = message.userName;
    
    const contentElement = document.createElement('div');
    contentElement.classList.add('content');
    contentElement.textContent = message.content;
    
    const timestampElement = document.createElement('div');
    timestampElement.classList.add('timestamp');
    
    // Add edited indicator if the message has been edited
    if (message.edited) {
      const editedIndicator = document.createElement('span');
      editedIndicator.classList.add('edited-indicator');
      editedIndicator.textContent = ' (edited)';
      timestampElement.appendChild(editedIndicator);
    }
    
    timestampElement.appendChild(document.createTextNode(formatTimestamp(message.timestamp)));
    
    messageDiv.appendChild(senderElement);
    messageDiv.appendChild(contentElement);
    messageDiv.appendChild(timestampElement);
    
    return messageDiv;
  }

  // Edit message function - improved to handle errors better and refresh messages
  async function editMessage(id) {
    console.log(`Attempting to edit message with ID: ${id}`);
    const messageElement = document.querySelector(`.message[data-message-id="${id}"]`);
    if (!messageElement) {
      console.error(`Message element with ID ${id} not found`);
      return;
    }
    
    const contentElement = messageElement.querySelector('.content');
    if (!contentElement) {
      console.error('Content element not found');
      return;
    }
    
    const currentContent = contentElement.textContent;
    const newContent = prompt('Edit your message:', currentContent);
    
    if (newContent !== null && newContent !== currentContent) {
      try {
        console.log(`Updating message ${id} with content: ${newContent}`);
        const updatedMessage = await updateMessageInAPI(id, newContent);
        
        if (updatedMessage) {
          console.log("Message successfully updated in database:", updatedMessage);
          
          // Instead of just updating the local element, refresh all messages
          // This ensures we have the latest data including the edited flag
          const messages = await getRecentMessages();
          displayMessages(messages);
          
          // Highlight the edited message briefly
          setTimeout(() => {
            const updatedElement = document.querySelector(`.message[data-message-id="${id}"]`);
            if (updatedElement) {
              updatedElement.classList.add('message-highlight');
              setTimeout(() => {
                updatedElement.classList.remove('message-highlight');
              }, 1500);
            }
          }, 100);
        } else {
          console.error("No response received after update");
          alert('Update may have failed. Please check and try again.');
        }
      } catch (error) {
        console.error('Failed to edit message:', error);
        alert('Could not update message. Please try again.');
      }
    }
  }

  // Delete message function - improved with better logging
  async function deleteMessage(id) {
    console.log(`Attempting to delete message with ID: ${id}`);
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        const success = await deleteMessageFromAPI(id);
        console.log(`Delete API response for message ${id}: ${success}`);
        
        if (success) {
          const messageElement = document.querySelector(`.message[data-message-id="${id}"]`);
          if (messageElement) {
            messageElement.remove();
          } else {
            console.warn(`Message element with ID ${id} not found for deletion`);
          }
        } else {
          alert('Could not delete message. Please try again.');
        }
      } catch (error) {
        console.error('Failed to delete message:', error);
        alert('Could not delete message. Please try again.');
      }
    }
  }

  // Format timestamp
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Display messages in the chat container
  function displayMessages(messages) {
    if (!chatMessagesContainer) return;
    
    chatMessagesContainer.innerHTML = '';
    
    // Ensure messages are sorted by timestamp (oldest first)
    const sortedMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp);
    
    sortedMessages.forEach(message => {
      const messageElement = createMessageElement(message);
      chatMessagesContainer.appendChild(messageElement);
    });
    
    // Scroll to bottom to show the newest messages
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  // Send a new message - updated to use API with better error handling
  async function sendMessage(content) {
    if (!content || !content.trim()) return;
    
    const message = {
      content: content,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: Date.now()
    };
    
    try {
      // Try to send via API first
      const result = await postMessageToAPI(message);
      if (result) {
        chatInput.value = '';
        const messages = await getRecentMessages();
        displayMessages(messages);
      } else {
        throw new Error('Failed to post message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // If API fails, at least show the message locally
      try {
        await saveMessage(message);
        chatInput.value = '';
        const messages = await getLocalMessages();
        displayMessages(messages);
        alert('Message saved locally (offline mode)');
      } catch (localError) {
        alert('Failed to send message. Please try again.');
      }
    }
  }

  // Generate a random demo message from another user
  function generateDemoMessage() {
    const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
    const demoMessages = [
      'Hey! How are you?',
      'I love this song!',
      'What genre are we listening to next?',
      'Anyone heard the new album by Taylor Swift?',
      'Can we add some jazz to the playlist?',
      'This beat is amazing!',
      'Who added this song? It\'s great!'
    ];
    
    const message = {
      content: demoMessages[Math.floor(Math.random() * demoMessages.length)],
      userId: 'demo-user-' + Math.floor(Math.random() * 1000),
      userName: randomUser,
      timestamp: Date.now()
    };
    
    return message;
  }

  // Event listeners
  sendMessageBtn.addEventListener('click', () => {
    sendMessage(chatInput.value);
  });

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage(chatInput.value);
    }
  });

  // Initialize app - updated to add demo messages every 5 seconds
  async function init() {
    try {
      await initDB();
      
      // Try to fetch messages from API first
      try {
        const apiMessages = await fetchMessagesFromAPI();
        console.log('API messages received:', apiMessages.length);
        displayMessages(apiMessages);
        connectionStatus.textContent = 'Connected to server';
        connectionStatus.classList.remove('offline', 'error');
      } catch (error) {
        console.warn('Could not connect to API, using local storage:', error);
        connectionStatus.textContent = 'Offline - using local storage';
        connectionStatus.classList.add('offline');
        connectionStatus.classList.remove('error');
        
        // Fall back to local storage if API fails
        const messages = await getLocalMessages();
        displayMessages(messages);
      }
      
      // Add a demo message every 5 seconds
      setInterval(async () => {
        try {
          const demoMessage = generateDemoMessage();
          console.log('Adding demo message:', demoMessage);
          await postMessageToAPI(demoMessage);
          const latestMessages = await getRecentMessages();
          displayMessages(latestMessages);
        } catch (error) {
          console.error('Error adding demo message:', error);
        }
      }, 5000); 
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      // Try to display a more user-friendly message in the chat container
      if (chatMessagesContainer) {
        chatMessagesContainer.innerHTML = `
          <div style="color: red; text-align: center; padding: 20px;">
            <p>Failed to initialize chat. Please try refreshing the page.</p>
            <p>Error: ${error.message || 'Unknown error'}</p>
          </div>
        `;
      }
    }
  }

  init();
});