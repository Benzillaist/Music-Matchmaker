import {Sequelize, DataTypes} from "sequelize"

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
});

const Message = sequelize.define("Message", {
});

class _SQLiteMessageModel {
    constructor() {

    }

    async init(fresh = false) {
        await sequelize.authenticate();
        await sequelize.sync({force: true});

        if(fresh) {
            await this.delete();
        }
    }

    async create(message) {
        return await Message.create(message);
    }

    async read(id = null) {
        // TODO: finish method

        return;
    }

    async update(message) {
        // TODO: finish method

        return;
    }

    async delete(message = null) {
        // TODO: finish method

        return;
    }
}

const SQLiteMessageModel = new _SQLiteMessageModel();

export default SQLiteMessageModel;