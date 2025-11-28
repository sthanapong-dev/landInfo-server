import Factory from "@/Configuration/Factory";
import { describeRoute } from "hono-openapi";
import Validator from "./Validator";
import Role from "@/Models/Roles";
import permissions from "@/seed/PermissionSeed";
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

class RoleService extends Factory {
    index = this.factory.createHandlers(
        this.verify,
        async (c) => {
            try {
                const limit = parseInt(c.req.query("limit") || "10", 10);
                const page = parseInt(c.req.query("page") || "1", 10);
                const result = await Role.aggregate([
                    {
                        $project: {
                            __v: 0,
                            permissions: 0
                        }

                    },
                    {
                        $facet: {
                            metadata: [{ $count: "total" }],
                            data: [{ $skip: (page - 1) * limit }, { $limit: limit }]
                        }
                    }
                ])
                const metadata = result[0]?.metadata[0] || { total: 0 };

                return c.json({
                    message: "Roles fetched successfully", data: result[0]?.data || [],
                    meta: {
                        current_page: page,
                        total: metadata.total,
                        pages: Math.ceil(metadata.total / limit),
                    }
                }, 200);
            } catch (err: any) {
                return c.json({ msg: "Error fetching roles", error: err.message }, 500);
            }
        }
    )

    getById = this.factory.createHandlers(
        this.verify,
        async (c) => {
            try {
                const roleId = c.req.param("id");
                if(roleId === undefined) {
                    return c.json({ msg: "Role ID is required" }, 400);
                }
                if(roleId.length !== 24){
                    return c.json({ msg: "Role not found" }, 404);
                }
                const result = await Role.aggregate([
                    {
                        $match: { _id: new ObjectId(roleId) }
                    },
                    {
                        $lookup: {
                            from: "permissions",
                            localField: "permissions",
                            foreignField: "key",
                            as: "permissions"
                        }
                       
                    },
                    { $project: { __v: 0, "permissions.__v": 0 ,"permissions._id": 0 } }
                ]);

                if (!result) {
                    return c.json({ msg: "Role not found" }, 404);
                }   
                return c.json({ msg: "Role fetched successfully", data: result }, 200);
            }
            catch (err: any) {
                return c.json({ msg: "Error fetching role", error: err.message }, 500);
            }
        }
    )

    create = this.factory.createHandlers(
        this.verify,
        Validator.create,
        describeRoute({
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                rolename: { type: "string" },
                                description: { type: "string" },
                                permissions: {
                                    type: "array",
                                    items: { type: "string" }
                                }
                            },
                            required: ["rolename", "description"],
                        },
                    },
                },
            }
        }),
        async (c) => {
            try {
                const { rolename, description, permissions } = c.req.valid("json");
                const existingRole = await Role.findOne({ name: rolename });

                if (existingRole) {
                    return c.json({ msg: "Role already exists" }, 400);
                }
                const result = await Role.create({
                    name: rolename,
                    description,
                    permissions: permissions || [],
                });

                if (!result) {
                    return c.json({ msg: "Failed to create role" }, 500);
                }

                return c.json({ msg: "Role created successfully", data: result }, 201);
            } catch (err: any) {
                return c.json({ msg: "Error creating role", error: err.message }, 500);
            }
        }
    )

    upadate = this.factory.createHandlers(
        this.verify,
        Validator.update,
        describeRoute({
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                rolename: { type: "string" },
                                description: { type: "string" },
                                permissions: {
                                    type: "array",
                                    items: { type: "string" }
                                }
                            },
                            required: ["rolename", "description"],
                        },
                    },
                },
            }
        }),
        async (c) => {
            try {
                const roleId = c.req.param("id");
                const { rolename, description, permissions } = c.req.valid("json");
                const role = await Role.findById(roleId);

                if (!role) {
                    return c.json({ msg: "Role not found" }, 404);
                }
                role.name = rolename || role.name;
                role.description = description || role.description;
                role.permissions = permissions || role.permissions;
                const result = await role.save();

                return c.json({ msg: "Role updated successfully", data: result }, 200);
            } catch (err: any) {
                return c.json({ msg: "Error updating role", error: err.message }, 500);
            }
        }
    )

}

export default new RoleService();