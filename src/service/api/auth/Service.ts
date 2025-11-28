import Factory from "@/Configuration/Factory";
import Validator from "./Validator";
import { describeRoute } from "hono-openapi";
import User from "@/Models/Users";
import JwtHandler from "@/Configuration/Jwt";

class AuthService extends Factory {
    login = this.factory.createHandlers(
        Validator.login,
        describeRoute({
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                usernameOrEmail: { type: "string" },
                                password: { type: "string", minLength: 6 },
                            },
                            required: ["usernameOrEmail", "password"],
                        },
                    },
                },
            }
        }),
        async (c) => {
            const { usernameOrEmail, password } = await c.req.json();
            const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
            if (!user) {
                return c.json({ msg: "Invalid username/email or password" }, 401);
            }
            const passwordMatch = await Bun.password.verify(password, user.password, "bcrypt");

            if (!passwordMatch) {
                return c.json({ msg: "Invalid username/email or password" }, 401);
            }
            await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
            const jwt = new JwtHandler();
            const token = await jwt.signToken({ userId: user._id, username: user.username, email: user.email }, "HS256");
            const refreshToken = await jwt.signRefeshToken({ userId: user._id }, "HS256");
            c.header(
                "Set-Cookie",
                `x-refresh-token=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
            );
            return c.json({ msg: "Login successful", token, refreshToken }, 200);
        }
    )
    me = this.factory.createHandlers(
        this.verify,
        async (c) => {
            const payload = c.get("jwtPayload");
            const user = await User.aggregate([
                {
                    $match: {
                        username: payload.username,
                        createdAt: { $ne: null }
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
                    $lookup: {
                        from: 'permissions',
                        localField: 'roles.permissions',
                        foreignField: 'key',
                        as: 'permissions'
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
                        permissions: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$permissions",
                                        as: "perm",
                                        cond: { $eq: ["$$perm.allow", true] }
                                    }
                                },
                                as: "perm",
                                in: "$$perm.resource"
                            }
                        }
                    }
                },
                {
                    $project: {
                        password: 0,
                        createdAt: 0,
                        "__v": 0,
                        "roles.__v": 0,
                        "roles._id": 0,
                        "roles.id": 0,
                        "roles.description": 0,
                        "roles.createdAt": 0,
                        "roles.permissions": 0,
                    }
                },
            ])

            if (!user) {
                return c.json({ msg: "User not found" }, 404);
            }
            return c.json({ msg: "Authorized", data: user }, 200);
        }
    )
    refreshToken = this.factory.createHandlers(
        async (c) => {
            try {
                const { refreshToken } = await c.req.json();
                const jwt = new JwtHandler();
                const decoded: any = jwt.verifyToken(refreshToken, process.env.JWT_SECRET || '');
                const user = await User.findById(decoded.userId);
                if (!user) {
                    return c.json({ msg: "User not found" }, 404);
                }
                const newToken = await jwt.signToken({ userId: user._id, username: user.username, email: user.email }, "HS256");
                return c.json({ token: newToken }, 200);
            } catch (error) {
                return c.json({ msg: "Invalid refresh token" }, 401);
            }
        }
    )

}

export default new AuthService();