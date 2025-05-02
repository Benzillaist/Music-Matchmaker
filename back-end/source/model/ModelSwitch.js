import MemoryUserModel from "./MemoryUserModel.js";
import MemoryGroupModel from "./MemoryGroupModel.js";
import MemoryMessageModel from "./MemoryMessageModel.js";

import SQLiteUserModel from "./SQLiteUserModel.js"
import SQLiteGroupModel from "./SQLiteGroupModel.js"
import SQLiteMessageModel from "./SQLiteMessageModel.js"

class _ModelSwitch {
  async getModel(model = "sqlite") {
    // Return objects with all three models
    if(model === "sqlite") {
      return {
        userModel: SQLiteUserModel,
        groupModel: SQLiteGroupModel,
        messageModel: SQLiteMessageModel
      }
    } else if(model === "sqlite-fresh") {
      await SQLiteUserModel.init(true);
      await SQLiteMessageModel.init(true);
      await SQLiteGroupModel.init(true);
      return {
        userModel: SQLiteUserModel,
        groupModel: SQLiteGroupModel,
        messageModel: SQLiteMessageModel
      }
    } else {
      return {
        userModel: MemoryUserModel,
        groupModel: MemoryGroupModel,
        messageModel: MemoryMessageModel
      };
    }
  }
}

const ModelSwitch = new _ModelSwitch();
export default ModelSwitch;
