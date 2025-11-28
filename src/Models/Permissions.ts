import mongoose, { Schema } from "mongoose";


const permissionsSchema = new Schema({
    key: { type: Number, required: true, unique: true },
    method: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    resource: { type: String, required: true },
    allow: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

permissionsSchema.index({ key: 1, resource: 1 }, { unique: true });
const Permission = mongoose.models.Permission || mongoose.model("Permission", permissionsSchema);

export default Permission;
