import bcrypt from "bcryptjs"
import User from "../model/SQLiteUserModel.js"


// Helper functions
const factoryResponse = (status, message) => ({status, message});

const existsUser = async (username) => {
    const user = await User.findOne({where: {username}});
    return user;
}

// Registration
export const register = async (req, res) => {
    const { username, password, spotify_id, pfp } = req.body;
  
    if (await existsUser(username)) {
        return res.status(400).json(factoryResponse(400, "Username already taken"));
    }
  
    const hash = await bcrypt.hash(password, 10);
    await User.create({ username: username, password: hash, id: spotify_id, pfp: pfp });
    res.json(factoryResponse(200, "Registration successful"));
    console.log("User registered successfully");
};

export const login = async (req, res, next) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json(factoryResponse(401, "Invalid credentials"));
    }
  
    req.login(user, (err) =>
      err ? next(err) : res.json(factoryResponse(200, "Login successful"))
    );
};


export const logout = (req, res) => {
    req.logout(function (err) {
      if (err) {
        res.json(factoryResponse(500, "Logout failed"));
        return;
      }
      res.json(factoryResponse(200, "Logout successful"));
    });
  };

export const getWebapp = (req, res) => {
    res.json(factoryResponse(200, `Welcome, ${req.user.username}`));
};  