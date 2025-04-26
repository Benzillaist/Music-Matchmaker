import ModelSwitch from "../model/ModelSwitch.js"

class DataController {
    constructor() {
        ModelSwitch.getModel().then((models) => {
            this.userModel = models.userModel;
            this.groupModel = models.groupModel;
            this.messageModel = models.messageModel; // Add message model
        });
    }

    // ==============================
    // ========= USER UTILS =========
    // ==============================

    async getAllUsers(req, res) {
        const users = await this.userModel.read();
        res.json({users});
    }

    async addUser(req, res) {
        if(!req.body || !req.body.id || !req.body.spotifyName || !req.body.pfp) {
            return res.status(400).json({error: "Add user request incomplete"});
        }

        req.body.displayName = req.body.spotifyName;
        req.body.groupId = null;

        const user = await this.userModel.create(req.body);

        return res.status(201).json(user);
    }

    async getUser(req, res) {
        if(!req.params || !req.params.id) {
            return res.status(400).json({error: "Get user request incomplete"});
        }

        const user = await this.userModel.read(req.params.id);
        res.json({user});
    }

    async updateUser(req, res) {
        if(!req.body || !req.body.user || !req.body.user.id) {
            return res.status(400).json({error: "Update user request incomplete"});
        }

        const user = req.body.user;

        await this.userModel.update(user);
        res.json(user);
    }

    async deleteUser(req, res) {
        if(!req.body || !req.body.user || !req.body.user.id) {
            return res.status(400).json({error: "Delete user request incomplete"});
        }

        await this.userModel.delete(req.body.user);
        res.json(await this.userModel.read());
    }

    async clearUsers(req, res) {
        await this.userModel.delete();
        res.json(await this.userModel.read());
    }

    // ===============================
    // ========= GROUP UTILS =========
    // ===============================

    async getAllGroups(req, res) {
        const groups = await this.groupModel.read();
        res.json({groups});
    }

    async addGroup(req, res) {
        if(!req.body || !req.body.groupname || !req.body.user_ids || !req.body.playlist_id) {
            return res.status(400).json({error: "Add group request incomplete"});
        }

        const group = await this.groupModel.create(req.body);

        return res.status(201).json(group);
    }

    async getGroup(req, res) {
        if(!req.params || !req.params.id) {
            return res.status(400).json({error: "Get group request incomplete"});
        }

        const group = await this.groupModel.read(req.params.id);
        res.json({group});
    }

    async updateGroup(req, res) {
        if(!req.body) {
            return res.status(400).json({error: "Update group request incomplete"});
        }

        const group = req.body;

        await this.groupModel.update(group);
        res.json(group);
    }

    async deleteGroup(req, res) {
        if(!req.body || !req.body.id) {
            return res.status(400).json({error: "Delete group request incomplete"});
        }

        await this.groupModel.delete(req.body);
        res.json(await this.groupModel.read());
    }

    async clearGroups(req, res) {
        await this.groupModel.delete();
        res.json(await this.groupModel.read());
    }

    // ===============================
    // ========= CHAT UTILS ==========
    // ===============================

    async getAllMessages(req, res) {
        try {
            // If you have a message model
            const messages = await this.messageModel.read();
            res.json(messages);
        } catch (error) {
            console.error("Error getting messages:", error);
            res.status(500).json({ error: "Failed to retrieve messages" });
        }
    }

    async addMessage(req, res) {
        try {
            if (!req.body || !req.body.content || !req.body.userId || !req.body.userName) {
                return res.status(400).json({ error: "Message data incomplete" });
            }

            const message = {
                content: req.body.content,
                userId: req.body.userId,
                userName: req.body.userName,
                timestamp: req.body.timestamp || Date.now(),
                id: req.body.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };

            // If you have a message model
            const savedMessage = await this.messageModel.create(message);
            return res.status(201).json(savedMessage);
        } catch (error) {
            console.error("Error adding message:", error);
            res.status(500).json({ error: "Failed to add message" });
        }
    }

    async getMessage(req, res) {
        try {
            if (!req.params || !req.params.id) {
                return res.status(400).json({ error: "Message ID required" });
            }

            // If you have a message model
            const message = await this.messageModel.read(req.params.id);
            if (!message) {
                return res.status(404).json({ error: "Message not found" });
            }
            
            res.json(message);
        } catch (error) {
            console.error("Error getting message:", error);
            res.status(500).json({ error: "Failed to retrieve message" });
        }
    }

    async updateMessage(req, res) {
        try {
            if (!req.params || !req.params.id || !req.body || !req.body.content) {
                return res.status(400).json({ error: "Update message request incomplete" });
            }

            // If you have a message model
            const message = await this.messageModel.read(req.params.id);
            if (!message) {
                return res.status(404).json({ error: "Message not found" });
            }

            message.content = req.body.content;
            message.edited = true;
            
            await this.messageModel.update(message);
            res.json(message);
        } catch (error) {
            console.error("Error updating message:", error);
            res.status(500).json({ error: "Failed to update message" });
        }
    }

    async deleteMessage(req, res) {
        try {
            if (!req.params || !req.params.id) {
                return res.status(400).json({ error: "Message ID required" });
            }

            // If you have a message model
            const message = await this.messageModel.read(req.params.id);
            if (!message) {
                return res.status(404).json({ error: "Message not found" });
            }

            await this.messageModel.delete({ id: req.params.id });
            res.json({ success: true, id: req.params.id });
        } catch (error) {
            console.error("Error deleting message:", error);
            res.status(500).json({ error: "Failed to delete message" });
        }
    }
}

export default new DataController;