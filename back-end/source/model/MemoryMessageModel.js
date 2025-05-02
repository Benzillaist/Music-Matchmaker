class _MemoryMessageModel {
    constructor() {
        this.messages = [];
    }

    async create(message) {
        // Ensure message has an ID
        if (!message.id) {
            message.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        
        this.messages.push(message);
        return message;
    }

    async read(id = null) {
        if (id) {
            return this.messages.find(message => message.id === id) || null;
        }
        
        // Return a copy of the messages array to prevent direct modification
        return [...this.messages];
    }

    async update(updatedMessage) {
        const index = this.messages.findIndex(message => message.id === updatedMessage.id);
        
        if (index !== -1) {
            this.messages[index] = {
                ...this.messages[index],
                ...updatedMessage,
                edited: true
            };
            return this.messages[index];
        }
        
        return null;
    }

    async delete(messageFilter = null) {
        if (messageFilter && messageFilter.id) {
            const index = this.messages.findIndex(message => message.id === messageFilter.id);
            
            if (index !== -1) {
                const deletedMessage = this.messages.splice(index, 1)[0];
                return deletedMessage;
            }
            
            return null;
        }
        
        // Delete all messages if no filter provided
        this.messages = [];
        return true;
    }
}

const MemoryMessageModel = new _MemoryMessageModel();

export default MemoryMessageModel;