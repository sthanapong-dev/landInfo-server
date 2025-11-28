import mongoose, {Schema} from "mongoose";
import Role from "./Roles";
const userSchema = new Schema({
  username: {type: String, required: true, unique: true},
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  roles:[{ type: Number, ref: 'Role' }],
  password: {type: String, required: true},
  createdAt: {type: Date, default: Date.now},
  deletedAt: {type: Date, default: null},
  lastLogin: {type: Date, default: null},
});

userSchema.virtual('roleDetails', {
  ref: Role,
  localField: 'roles',
  foreignField: 'id',
  justOne: false,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
