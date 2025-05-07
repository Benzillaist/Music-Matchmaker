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
    autobio: {
        type: DataTypes.TEXT,
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
        
        if (fresh) {
            // Only use force:true when explicitly asked to reset the database
            await sequelize.sync({force: true});
            await this.delete();
        } else {
            // Normal startup - don't drop tables
            await sequelize.sync({force: false});
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
        // Changed from user.id to user.username to match the primaryKey
        const useru = await User.findByPk(user.username);

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

        // Changed from user.id to user.username to match the primaryKey
        await User.destroy({where: {username: user.username}});
        return user;
    }
}

const SQLiteUserModel = new _SQLiteUserModel();

export default SQLiteUserModel;