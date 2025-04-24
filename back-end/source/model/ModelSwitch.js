import MemoryUserModel from "./MemoryUserModel.js";
import MemoryGroupModel from "./MemoryGroupModel.js";

class _ModelSwitch {
  async getModel(model = "inMemory") {
    if(model === "inMemory") {
        return (MemoryUserModel, MemoryGroupModel);
    } else {
        return (MemoryUserModel, MemoryGroupModel);
    }
  }
}

const ModelSwitch = new _ModelSwitch();
export default ModelSwitch;
