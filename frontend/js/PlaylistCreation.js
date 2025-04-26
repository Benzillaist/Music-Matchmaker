document.addEventListener('DOMContentLoaded', () => {
  const createPlaylistButton = document.getElementById('createPlaylistButton');
  const playlistContainer = document.getElementById('playlist');

  if (!createPlaylistButton || !playlistContainer) {
    console.error('Playlist elements not found in the DOM. Playlist functionality disabled.');
    return;
  }

  const mockTracks = [
    "Leave The Door Open - Bruno Mars",
    "Blinding Lights - The Weeknd",
    "Peaches - Justin Bieber",
    "Watermelon Sugar - Harry Styles",
    "Levitating - Dua Lipa",
    "Shivers - Ed Sheeran",
    "good 4 u - Olivia Rodrigo",
    "As It Was - Harry Styles",
    "Stay - The Kid LAROI & Justin Bieber",
    "Uptown Funk - Mark Ronson ft. Bruno Mars"
  ];

  let db;
  const DB_NAME = 'musicPlaylists';
  const STORE_NAME = 'playlists';

  function initDB() {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            store.createIndex('name', 'name', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          db = event.target.result;
          console.log('Database initialized');
          resolve(db);
        };

        request.onerror = (event) => {
          console.error('Database init error:', event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error('Critical DB init error:', error);
        reject(error);
      }
    });
  }

  function savePlaylist(playlist) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(playlist);

        request.onsuccess = () => {
          console.log('Playlist saved');
          resolve();
        };

        request.onerror = (event) => {
          console.error('Save playlist error:', event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error('Save error:', error);
        reject(error);
      }
    });
  }

  function getAllPlaylists() {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }

      try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          console.error('Get playlists error:', event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error('Get all error:', error);
        reject(error);
      }
    });
  }

  function deletePlaylist(id) {
    if (!db) {
      console.error('Database not initialized');
      return;
    }

    const confirmDelete = confirm('Are you sure you want to delete this playlist?');
    if (!confirmDelete) return;

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log(`Playlist ${id} deleted`);
      loadPlaylists();
    };

    request.onerror = (event) => {
      console.error('Delete error:', event.target.error);
    };
  }

  function createPlaylistElement(playlist) {
    const playlistDiv = document.createElement('div');
    playlistDiv.classList.add('playlist');
    playlistDiv.style.border = '1px solid #ccc';
    playlistDiv.style.padding = '10px';
    playlistDiv.style.marginBottom = '10px';

    const nameElement = document.createElement('div');
    nameElement.classList.add('name');
    nameElement.textContent = `🎵 ${playlist.name}`;
    playlistDiv.appendChild(nameElement);

    if (playlist.tracks && playlist.tracks.length > 0) {
      const trackList = document.createElement('ol');
      playlist.tracks.forEach(track => {
        const li = document.createElement('li');
        li.textContent = track;
        trackList.appendChild(li);
      });
      playlistDiv.appendChild(trackList);
    }

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑 Delete Playlist';
    deleteButton.style.marginTop = '10px';
    deleteButton.addEventListener('click', () => deletePlaylist(playlist.id));
    playlistDiv.appendChild(deleteButton);

    return playlistDiv;
  }

  function displayPlaylists(playlists) {
    playlistContainer.innerHTML = '';

    playlists.forEach(playlist => {
      const element = createPlaylistElement(playlist);
      playlistContainer.appendChild(element);
    });
  }

  function loadPlaylists() {
    getAllPlaylists()
      .then(displayPlaylists)
      .catch(console.error);
  }

  function createNewPlaylist() {
    const playlistName = prompt('Enter playlist name:');
    if (playlistName && playlistName.trim()) {
      const newPlaylist = {
        name: playlistName.trim(),
        tracks: [...mockTracks]
      };

      savePlaylist(newPlaylist)
        .then(() => loadPlaylists())
        .catch(console.error);
    }
  }

  createPlaylistButton.addEventListener('click', createNewPlaylist);

  async function init() {
    try {
      await initDB();
      loadPlaylists();
    } catch (error) {
      console.error('App init error:', error);
    }
  }

  init();
});
