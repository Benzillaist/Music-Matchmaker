import {Sequelize, DataTypes} from "sequelize"

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite",
});

const Message = sequelize.define("Message", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.BIGINT,
        defaultValue: () => Date.now()
    },
    edited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

class _SQLiteMessageModel {
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

    async create(message) {
        return await Message.create(message);
    }

    async read(id = null) {
        if (id) {
            return await Message.findByPk(id);
        }
        // Return only the 50 most recent messages sorted by timestamp (newest first)
        return await Message.findAll({
            order: [['timestamp', 'DESC']], 
            limit: 50 // Reduced from 100 to 50 to save space
        });
    }

    async update(message) {
        try {
            const messageRecord = await Message.findByPk(message.id);
            
            if (!messageRecord) {
                console.error(`Message with id ${message.id} not found in database`);
                return null;
            }
            
            // Set edited flag to true when updating
            message.edited = true;
            
            console.log(`Updating message ${message.id} in database:`, message);
            
            // Use await to ensure the update is complete
            await messageRecord.update(message);
            
            // Reload to get the fresh data from the database
            await messageRecord.reload();
            
            console.log(`Updated message data:`, messageRecord.dataValues);
            return messageRecord;
        } catch (error) {
            console.error(`Error updating message in SQLite:`, error);
            throw error;
        }
    }

    async delete(message = null) {
        if (message === null) {
            // Delete all messages
            await Message.destroy({ truncate: true });
            return;
        }

        // Delete specific message
        await Message.destroy({ where: { id: message.id } });
        return message;
    }
}

const SQLiteMessageModel = new _SQLiteMessageModel();

export default SQLiteMessageModel;