export class DB {
    constructor(DBName) {
        this.DBName = DBName;
        this.OSName = "data";

        console.log("constructor: " + this.OSName);
    }

    async openDatabase() {
        let DBName = this.DBName;
        let OSName = this.OSName;

        return new Promise((resolve, reject) => {
            if (this.DBName === "") {
                reject("Database name cannot be empty.");
                return;
            }

            let request = indexedDB.open(DBName, 1);

            request.onupgradeneeded = (event) => {
                let db = event.target.result;

                console.log("contains onupgradeneeded: " + db.objectStoreNames.contains(String(OSName)));

                if (!db.objectStoreNames.contains(String(OSName))) {
                    db.createObjectStore(String(OSName));
                }

                console.log("contains onupgradeneeded: " + db.objectStoreNames.contains(String(OSName)));


            }
            request.onsuccess = function (event) {
                let db = event.target.result;

                console.log("contains onsuccess: " + db.objectStoreNames.contains(String(OSName)));

                resolve(db);
            };
            request.onerror = function (event) {
                reject(event.target.error);
            };
        });
    }

    async saveData(key, data) {
        console.log("saveData: " + this.OSName);
        const db = await this.openDatabase();
        console.log("OS names: " + Object.keys(db.objectStoreNames));
        const tx = db.transaction(this.OSName, "readwrite");
        const store = tx.objectStore(this.OSName);
        store.put(data, key);

        return new Promise((resolve, reject) => {
            tx.oncomplete = function () {
                console.log("Data added successfully!");
                resolve("Data added successfully!");
            };
            tx.onerror = function (error) {
                reject("Failed to add data.");
            };
        });
    }

    async getData(key) {
        const db = await this.openDatabase();
        const tx = db.transaction(this.OSName, "readonly");
        const store = tx.objectStore(this.OSName);
        let request = store.get(key);

        // TASK: Implement this method
        return new Promise((resolve, reject) => {
            request.onsuccess = function () {
                resolve(request.result);
            };
            request.onerror = function () {
                reject("Failed to get data.");
            };
        });
    }

    // async openDatabase() {
    //     return new Promise((resolve, reject) => {
    //       if (this.dbName === "") {
    //         reject("Database name cannot be empty.");
    //         return;
    //       }

    //       let request = indexedDB.open(this.dbName, 1);
    //       request.onupgradeneeded = function (event) {
    //         let db = event.target.result;
    //         if (!db.objectStoreNames.contains("tasks")) {
    //           db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
    //         }
    //       };
    //       request.onsuccess = function (event) {
    //         resolve(event.target.result);
    //       };
    //       request.onerror = function (event) {
    //         reject(event.target.error);
    //       };
    //     });
    //   }

    // async addTask(task) {
    //     const db = await this.openDatabase();
    //     const tx = db.transaction("tasks", "readwrite");
    //     const store = tx.objectStore("tasks");
    //     store.put({b});

    //     return new Promise((resolve, reject) => {
    //       tx.oncomplete = function () {
    //         resolve("Task added successfully!");
    //       };
    //       tx.onerror = function () {
    //         reject("Failed to add task.");
    //       };
    //     });
    //   }


    // let db;
    // const DB_NAME = 'musicMatchmaker';
    // const STORE_NAME = 'data';

    // const _initDB = () => {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             const request = indexedDB.open(DB_NAME, 1);

    //             request.onupgradeneeded = (event) => {
    //                 const db = event.target.result;
    //                 if (!db.objectStoreNames.contains(STORE_NAME)) {
    //                 const store = db.createObjectStore(STORE_NAME);
    //                 // store.createIndex('timestamp', 'timestamp', { unique: false });
    //                 }
    //             };

    //             request.onsuccess = (event) => {
    //                 db = event.target.result;
    //                 console.log('Database initialized successfully');
    //                 resolve(db);
    //             };

    //             request.onerror = (event) => {
    //                 console.error('Error initializing database:', event.target.error);
    //                 reject(event.target.error);
    //             };

    //         } catch (error) {
    //             console.error('Critical error during database initialization:', error);
    //             reject(error);
    //         }
    //     });
    // }

    // const _saveData = async (value) => {
    //     return new Promise((resolve, reject) => {
    //         if(!db) {
    //             reject(new Error('Database not initialized'))
    //             return;
    //         }

    //         console.log("Value: " + value);

    //         try {
    //             const transaction = db.transaction(STORE_NAME, 'readwrite');
    //             console.log("Valu345e: " + value);
    //             const store = transaction.objectStore(STORE_NAME);
    //             console.log("Val456345ue: " + value);
    //             const request = store.add(value);
    //             console.log("Val5642563464564ue: " + value);

    //             request.onsuccess = () => {
    //                 console.log('Data saved successfully');
    //                 resolve();
    //             };

    //             request.onerror = (event) => {
    //                 console.error('Error saving data:', event.target.error);
    //                 reject(event.target.error);
    //             };
    //         } catch (error) {
    //             console.error('Error in saveData: ', error);
    //             reject(error);
    //         }
    //     });
    // }

    // const _getData = (key) => {
    //     return new Promise((resolve, reject) => {
    //         if (!db) {
    //           reject(new Error('Database not initialized'));
    //           return;
    //         }

    //         try {
    //             const transaction = db.transaction([STORE_NAME], 'readonly');
    //             const store = transaction.objectStore(STORE_NAME);
    //             const request = store.get(key);

    //             request.onsuccess = (event) => {
    //                 console.log('Data saved successfully');
    //                 resolve(request.result);
    //             };

    //             request.onerror = (event) => {
    //                 console.error('Error getting data:', event.target.error);
    //                 reject(event.target.error);
    //             };
    //         } catch (error) {
    //             console.error('Error in getData: ', error);
    //             reject(error);
    //         }
    //     });
    // }


    // return {
    //     openDatabase() {
    //         return _openDatabase();
    //     },

        // initDB() {
        //     return _initDB();
        // },
        // saveData(key, value) {
        //     return _saveData(key, value);
        // },
        // getData(key) {
        //     return _getData(key);
        // }
}

// export {DB}