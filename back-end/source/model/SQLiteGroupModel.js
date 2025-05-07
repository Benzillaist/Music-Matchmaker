import {Sequelize, DataTypes} from "sequelize"

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
});

const Group = sequelize.define("Group", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    group_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_ids: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    playlist_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ratings: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

class _SQLiteGroupModel {
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

    async create(group) {
        console.log("create group:", group);
        return await Group.create(group);
    }

    async read(id = null) {
        if(id) {
            return await Group.findByPk(id);
        }
        return await Group.findAll();
    }

    async update(group) {
        const groupu = await Group.findByPk(group.id);

        if(!groupu) {
            return null;
        }

        await groupu.update(group);
        return groupu;
    }

    async delete(group = null) {
        if(group === null) {
            await Group.destroy({truncate: true});
            return;
        }

        await Group.destroy({where: {id: group.id}});
        return group;
    }
}

const SQLiteGroupModel = new _SQLiteGroupModel();

export default SQLiteGroupModel;