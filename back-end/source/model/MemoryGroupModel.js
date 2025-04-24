class _MemoryGroupModel {
    static id = 0;

    constructor() {
        this.groups = [];
    }

    async create(group) {
        if(this.groups.some((g) => g.id === group.id)) {
            throw new Error(`Group with id=${group.id} already exists, no new group added`);
        }
        this.groups.push(group);
        return group;
    }

    async read(id = null) {
        if(id) {
            return this.groups.find((group) => group.id === id);
        }
        return this.groups;
    }

    async update(group) {
        const index = this.groups.findIndex((g) => g.id === group.id);
        this.groups[index] = group;
        return group;
    }

    async delete(group) {
        if(group === null) {
            this.groups = [];
            return;
        }

        const index = this.groups.findIndex((g) => g.id === group.id);
    this.groups.splice(index, 1);
    return group;
    }
}

const MemoryGroupModel = new _MemoryGroupModel();

export default MemoryGroupModel;