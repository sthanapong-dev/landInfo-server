import Factory from "@/Configuration/Factory";
import Validator from "./Validator";
import { describeRoute } from "hono-openapi";
import User from "@/Models/Users";
// import { pack } from 'msgpackr'

class UserService extends Factory {
    index = this.factory.createHandlers(
        this.verify,
        async (c) => {
            try {
                const limit = parseInt(c.req.query("limit") || "10", 10);
                const page = parseInt(c.req.query("page") || "1", 10);

                const result = await User.aggregate([
                    {
                        $project: {
                            password: 0,
                            __v: 0
                        }
                    },
                    {
                        $lookup: {
                            from: 'roles',
                            localField: 'roles',
                            foreignField: 'id',
                            as: 'roles'
                        }
                    },
                    {
                        $addFields: {
                            primaryRole: { $arrayElemAt: ["$roles.name", 0] },
                            roles: {
                                $map: {
                                    input: "$roles",
                                    as: "role",
                                    in: "$$role.name"
                                }
                            },

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
                const data = {
                    data: result[0]?.data || [],
                    meta: {
                        current_page: page,
                        total: metadata.total,
                        pages: Math.ceil(metadata.total / limit),
                    }
                }
                // const resp = new Uint8Array(pack({ data: data }));
                // return c.newResponse(resp, 200, {
                //     'Content-Type': 'application/msgpack'
                // });
                return c.json({ msg: "success", ...data }, 200)
            } catch (err: any) {
                return c.json({ msg: "Error fetching users", error: err.message }, 500);
            }
        }
    );
    index2 = this.factory.createHandlers(
        this.verify,
        async (c) => {
            try {
                const users = await User.find({}, { password: 0 }).select('username email -password -__v');
                return c.json({ data: users }, 200);
            } catch (err: any) {
                return c.json({ msg: "Error fetching users", error: err.message }, 500);
            }
        }
    );
    createUser = this.factory.createHandlers(
        this.verify,
        describeRoute({
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                username: { type: "string" },
                                email: { type: "string", format: "email" },
                                password: { type: "string", minLength: 6 },
                                name: { type: "string" },
                            },
                            required: ["username", "email", "password", "name"],
                        },
                    },
                },
            }
        }),
        Validator.createUser,
        async (c) => {
            const { username, email, name, password } = await c.req.json();
            try {

                if (await User.findOne({ $or: [{ username }, { email }] })) {
                    return c.json({ msg: "Username or email already exists" }, 400);
                }

                const bcryptHash = await Bun.password.hash(password, {
                    algorithm: 'bcrypt',
                    cost: 4,
                });

                const newUser = new User({
                    username,
                    email,
                    name,
                    password: bcryptHash,
                });
                await newUser.save();
                return c.json({ msg: "User created successfully" }, 201);
            } catch (err: any) {
                return c.json({ msg: "Error creating user", error: err.message }, 500);
            }

        });

}

export default new UserService();