import ModelSwitch from "../model/ModelSwitch.js"
import bcrypt from "bcryptjs"

class DataController {
    constructor() {
        ModelSwitch.getModel("sqlite").then((models) => {
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
        if(!req.body || !req.body.username || !req.body.pfp || !req.body.password) {
            return res.status(400).json({error: "Add user request incomplete"});
        }

        req.body.groupId = null;
        // Set autobio to empty string if not provided
        if (req.body.autobio === undefined) {
            req.body.autobio = "";
        }

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
        try {
            // Check if request is valid
            if(!req.body || !req.body.user || !req.body.user.id) {
                return res.status(400).json({error: "Update user request incomplete"});
            }

            // Check if userModel is initialized
            if (!this.userModel) {
                console.error("User model not initialized");
                return res.status(500).json({error: "Database not ready. Please try again."});
            }

            const user = req.body.user;
            console.log("Updating user:", user);
            
            // Ensure autobio field is included in the update
            if(user.autobio === undefined) {
                // If not provided, don't overwrite existing autobio
                const existingUser = await this.userModel.read(user.id);
                if(existingUser && existingUser.autobio) {
                    user.autobio = existingUser.autobio;
                }
            }

            // Update user in database
            const updatedUser = await this.userModel.update(user);
            
            if (!updatedUser) {
                return res.status(404).json({error: "User not found or update failed"});
            }
            
            console.log("User updated successfully:", updatedUser);
            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error("Error updating user:", error);
            return res.status(500).json({
                error: "Failed to update user",
                details: error.message
            });
        }
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

    // Add a specific method for user registration with password hashing
    async registerUser(req, res) {
        try {
            if(!req.body || !req.body.username || !req.body.password) {
                return res.status(400).json({error: "Registration requires username and password"});
            }

            // Check if username already exists
            const existingUser = await this.userModel.read(req.body.username);
            if (existingUser) {
                return res.status(409).json({error: "Username already exists"});
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            // Prepare user object
            const newUser = {
                username: req.body.username,
                password: hashedPassword,
                pfp: req.body.pfp || "default-profile.png", // Default profile picture
                autobio: req.body.autobio || "",
                groupId: null
            };

            // Create the user
            const user = await this.userModel.create(newUser);
            
            // Remove password before sending response
            const userResponse = {...user};
            delete userResponse.password;

            return res.status(201).json({
                message: "User registered successfully",
                user: userResponse
            });
        } catch (error) {
            console.error("Registration error:", error);
            return res.status(500).json({
                error: "Failed to register user",
                details: error.message
            });
        }
    }

    // ===============================
    // ========= GROUP UTILS =========
    // ===============================

    async getAllGroups(req, res) {
        var groups = await this.groupModel.read();

        for(let i = 0; i < groups.length; i++) {
            groups[i].user_ids = JSON.parse(groups[i].user_ids).user_ids;
            groups[i].ratings = JSON.parse(groups[i].ratings).ratings;
        }

        res.json({groups});
    }

    async addGroup(req, res) {

        if(!req.body || !req.body.group_name || !req.body.user_ids || !req.body.playlist_id) {
            return res.status(400).json({error: "Add group request incomplete"});
        }

        req.body.ratings = JSON.stringify({"ratings": []});

        var group = await this.groupModel.create(req.body);

        group.ratings = JSON.parse(group.ratings).ratings;

        return res.status(201).json(group);
    }

    async getGroup(req, res) {
        if(!req.params || !req.params.id) {
            return res.status(400).json({error: "Get group request incomplete"});
        }

        var group = await this.groupModel.read(req.params.id);

        group.user_ids = JSON.parse(group.user_ids).user_ids;
        group.ratings = JSON.parse(group.ratings).ratings;

        res.json({group});
    }

    async updateGroup(req, res) {
        if(!req.body) {
            return res.status(400).json({error: "Update group request incomplete"});
        }

        var group = req.body;

        group.user_ids = JSON.stringify({"user_ids": group.user_ids})
        group.ratings = JSON.stringify({"ratings": group.ratings});

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
            const messages = await this.messageModel.read();
            console.log("Sending messages to client:", messages);
            // Return consistent array format
            return res.status(200).json(messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
            return res.status(500).json({ error: "Failed to fetch messages" });
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

            const savedMessage = await this.messageModel.create(message);
            return res.status(201).json(savedMessage);
        } catch (error) {
            console.error("Error adding message:", error);
            res.status(500).json({ error: "Failed to add message" });
        }
    }

    async getMessage(req, res) {
        try {
            const messageId = req.params.id;
            if (!messageId) {
                return res.status(400).json({ error: "Message ID is required" });
            }

            const message = await this.messageModel.read(messageId);
            if (!message) {
                return res.status(404).json({ error: "Message not found" });
            }

            return res.status(200).json(message);
        } catch (error) {
            console.error("Error fetching message:", error);
            res.status(500).json({ error: "Failed to fetch message" });
        }
    }

    async updateMessage(req, res) {
        try {
            const messageId = req.params.id;
            if (!messageId) {
                return res.status(400).json({ error: "Message ID is required" });
            }

            if (!req.body) {
                return res.status(400).json({ error: "Message data is required" });
            }

            // Log the incoming request
            console.log(`Received update request for message ${messageId}:`, req.body);

            // First check if the message exists
            const existingMessage = await this.messageModel.read(messageId);
            
            if (!existingMessage) {
                console.error(`Message ${messageId} not found in database`);
                return res.status(404).json({ error: "Message not found" });
            }

            // Use the full message object that was sent from the client
            const updatedMessage = {
                ...existingMessage,
                ...req.body,
                id: messageId // Ensure the ID is preserved
            };
            
            // Make sure the edited flag is set
            updatedMessage.edited = true;

            console.log(`Updating message ${messageId} with:`, updatedMessage);
            
            // Update the message in the database
            const result = await this.messageModel.update(updatedMessage);
            
            if (!result) {
                console.error(`Failed to update message ${messageId} in database`);
                return res.status(500).json({ error: "Database update failed" });
            }
            
            console.log(`Message ${messageId} updated successfully:`, result);
            return res.status(200).json(result);
        } catch (error) {
            console.error(`Error updating message ${req.params.id}:`, error);
            return res.status(500).json({ 
                error: "Failed to update message", 
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    async deleteMessage(req, res) {
        try {
            const messageId = req.params.id;
            if (!messageId) {
                return res.status(400).json({ error: "Message ID is required" });
            }

            // Get existing message first to verify it exists
            const existingMessage = await this.messageModel.read(messageId);
            if (!existingMessage) {
                return res.status(404).json({ error: "Message not found" });
            }

            await this.messageModel.delete({ id: messageId });
            return res.status(200).json({ message: "Message deleted successfully" });
        } catch (error) {
            console.error("Error deleting message:", error);
            res.status(500).json({ error: "Failed to delete message" });
        }
    }
}

export default new DataController;