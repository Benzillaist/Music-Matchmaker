import {Sequelize, DataTypes} from "sequelize"

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
});

const User = sequelize.define("User", {
    username: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pfp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    groupId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
});

class _SQLiteUserModel {
    constructor() {

    }

    async init(fresh = false) {
        await sequelize.authenticate();
        await sequelize.sync({force: true});

        if(fresh) {
            await this.delete();
        }
    }

    async create(user) {
        return await User.create(user);
    }

    async read(id = null) {
        if(id) {
            return await User.findByPk(id);
        }
        return await User.findAll();
    }

    async update(user) {
        const useru = await User.findByPk(user.id);

        if(!useru) {
            return null;
        }

        await useru.update(user);
        return useru;
    }

    async delete(user = null) {
        if(user === null) {
            await User.destroy({truncate: true});
            return;
        }

        await User.destroy({where: {id: user.id}});
        return user;
    }
}

const SQLiteUserModel = new _SQLiteUserModel();

export default SQLiteUserModel;