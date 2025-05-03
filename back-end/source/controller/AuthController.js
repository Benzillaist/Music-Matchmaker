import ModelSwitch from "../model/ModelSwitch.js"
import bcrypt from "bcryptjs"
import User from "../model/SQLiteUserModel.js"


// Registration
class AuthController {
    constructor() {
        ModelSwitch.getModel("sqlite").then((models) => {
            this.userModel = models.userModel;
            this.groupModel = models.groupModel;
            this.messageModel = models.messageModel;
        });

        this.factoryResponse = (status, message) => ({status, message});

        this.existsUser = async (username) => {
            const user = await this.userModel.read(username);
            return user;
        }
    }

    async register(req, res) {
        const { username, password } = req.body;
    
        if (await this.existsUser(username)) {
            return res.status(400).json(this.factoryResponse(400, "Username already taken"));
        }

        const hash = await bcrypt.hash(password, 10);
        await this.userModel.create({ username: username, password: hash });
        res.json(this.factoryResponse(200, "Registration successful"));
        console.log("User registered successfully");
    };

    async login(req, res, next) {
        const { username, password } = req.body;
        const user = await this.userModel.read(username);
        if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json(this.factoryResponse(401, "Invalid credentials"));
        }
    
        req.login(user, async (err) =>
            // res.redirect('/?view=home')
            err ? await next(false) : awaitnext(true)
            // err ? next(err) : res.json(this.factoryResponse(200, "Login successful"))
        );
    };

    async logout(req, res) {
        req.logout(function (err) {
            if (err) {
                res.json(this.factoryResponse(500, "Logout failed"));
                return;
            }
            res.json(this.factoryResponse(200, "Logout successful"));
        });
    };

    async getWebapp(req, res) {
        res.json(this.factoryResponse(200, `Welcome, ${req.user.username}`));
    };  
}

export default new AuthController;