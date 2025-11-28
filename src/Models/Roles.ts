import mongoose, {Schema} from "mongoose";
import Permission from "./Permissions";

const roleSchema = new Schema({
  id: {type: Number, required: true, unique: true},
  name: {type: String, required: true, unique: true},
  description: {type: String, required: true},
  permissions: [{ type: Number, ref: 'Permission' }],
  createdAt: {type: Date, default: Date.now},
  lastLogin: {type: Date},
});

roleSchema.virtual('permissionDetails', {
  ref: Permission,
  localField: 'permissions',
  foreignField: 'key',
  justOne: false,
});

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

export default Role;
