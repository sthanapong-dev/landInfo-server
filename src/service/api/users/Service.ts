import Factory from "@/Configuration/Factory";
import Validator from "./Validator";
import { describeRoute } from "hono-openapi";
import User from "@/Models/Users";

class UserService extends Factory {
    index = this.factory.createHandlers(
        this.verify,
        async (c) => {
            try {
                const users = await User.find({}, { password: 0 }).select('username email -password -__v');
                return c.json({ data: users }, 200);
            } catch (err:any) {
                return c.json({ message: "Error fetching users", error: err.message }, 500);
            }
        }
    );
    createUser = this.factory.createHandlers(
        // this.verify,
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

                if (await User.findOne({ $or: [{username }, { email }] })) {
                    return c.json({ message: "Username or email already exists" }, 400);
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
                return c.json({ message: "User created successfully" }, 201);
            } catch (err:any) {
                return c.json({ message: "Error creating user", error: err.message }, 500);
            }

        });

}

export default new UserService();