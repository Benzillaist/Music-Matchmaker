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

  // Get the 5 most recent messages
  function getRecentMessages() {
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
        console.error('Error in getRecentMessages:', error);
        reject(error);
      }
    });
  }

  // Create and display message element
  function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    // Add appropriate class based on sender
    if (message.userId === currentUser.id) {
      messageDiv.classList.add('message-self');
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
    timestampElement.textContent = formatTimestamp(message.timestamp);
    
    messageDiv.appendChild(senderElement);
    messageDiv.appendChild(contentElement);
    messageDiv.appendChild(timestampElement);
    
    return messageDiv;
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
    
    messages.forEach(message => {
      const messageElement = createMessageElement(message);
      chatMessagesContainer.appendChild(messageElement);
    });
    
    // Scroll to bottom
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  // Send a new message
  async function sendMessage(content) {
    if (!content || !content.trim()) return;
    
    const message = {
      content: content,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: Date.now()
    };
    
    try {
      await saveMessage(message);
      const messages = await getRecentMessages();
      displayMessages(messages);
      chatInput.value = '';
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
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

  // Initialize app
  async function init() {
    try {
      await initDB();
      
      // Add some initial demo messages if there aren't any
      const messages = await getRecentMessages();
      
      if (messages.length === 0) {
        // Add 3 demo messages
        for (let i = 0; i < 3; i++) {
          await saveMessage(generateDemoMessage());
        }
      }
      
      // Display messages
      const updatedMessages = await getRecentMessages();
      displayMessages(updatedMessages);
      
      // For demo purposes: Add a new message every 30 seconds
      setInterval(async () => {
        try {
          await saveMessage(generateDemoMessage());
          const latestMessages = await getRecentMessages();
          displayMessages(latestMessages);
        } catch (error) {
          console.error('Error in demo message interval:', error);
        }
      }, 30000);
      
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

  // Start the app
  init();
});