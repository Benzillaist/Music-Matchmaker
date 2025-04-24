class _MemoryUserModel {
    constructor() {
        this.users = [];
    }

    async create(user) {
        if(this.users.some((u) => u.id === user.id)) {
            throw new Error(`User with id=${user.id} already exists, no new user added`);
        }
        this.users.push(user);
        return user;
    }

    async read(id = null) {
        if(id) {
            return this.users.find((user) => user.id === id);
        }
        return this.users;
    }

    async update(user) {
        const index = this.users.findIndex((u) => u.id === user.id);
        this.users[index] = user;
        return user;
    }

    async delete(user) {
        if(user === null) {
            this.users = [];
            return;
        }

        const index = this.users.findIndex((u) => u.id === user.id);
    this.users.splice(index, 1);
    return user;
    }
}

const MemoryUserModel = new _MemoryUserModel();

export default MemoryUserModel;