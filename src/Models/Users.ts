import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
  username: {type: String, required: true, unique: true},
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  createdAt: {type: Date, default: Date.now},
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
