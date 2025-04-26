import MemoryUserModel from "./MemoryUserModel.js";
import MemoryGroupModel from "./MemoryGroupModel.js";
import MessageModel from "./MessageModel.js";

class _ModelSwitch {
  async getModel(model = "inMemory") {
    // Return objects with all three models
    return {
      userModel: MemoryUserModel,
      groupModel:  MemoryGroupModel,
      messageModel: new MessageModel()
    };
  }
}

const ModelSwitch = new _ModelSwitch();
export default ModelSwitch;
