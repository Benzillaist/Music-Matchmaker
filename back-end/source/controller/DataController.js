import ModelSwitch from "../model/ModelSwitch.js"

class DataController {
    constructor() {
        ModelSwitch.getModel().then((model) => {
            this.userModel, this.groupModel = model;
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

        req.body.username = req.body.id;
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
        if(!req.body || !req.body.id || !req.body.groupname || !req.body.userids || !req.body.playlistid) {
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
        if(!req.body || !req.body.group || !req.body.group.id) {
            return res.status(400).json({error: "Update group request incomplete"});
        }

        const group = req.body.group;

        await this.groupModel.update(group);
        res.json(group);
    }

    async deleteGroup(req, res) {
        if(!req.body || !req.body.group || !req.body.group.id) {
            return res.status(400).json({error: "Delete group request incomplete"});
        }

        await this.groupModel.delete(req.body.group);
        res.json(await this.groupModel.read());
    }

    async clearGroups(req, res) {
        await this.groupModel.delete();
        res.json(await this.groupModel.read());
    }
}

export default new DataController;