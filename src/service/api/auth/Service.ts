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
                return c.json({ message: "Invalid username/email or password" }, 401);
            }
            const passwordMatch = await Bun.password.verify(password, user.password, "bcrypt");

            if (!passwordMatch) {
                return c.json({ message: "Invalid username/email or password" }, 401);
            }
            const jwt = new JwtHandler();
            const token = await jwt.signToken({ userId: user._id, username: user.username, email: user.email }, "HS256");
             c.header("Set-Cookie", `x-token=${token}; HttpOnly; Path=/; Max-Age=3600`);
            return c.json({ message: "Login successful", token }, 200);
        }
    )
    me = this.factory.createHandlers(
        this.verify,
        async (c) => {
            const payload = c.get("jwtPayload");
            const user = User.findById(payload.userId);
            if (!user) {
                return c.json({ message: "User not found" }, 404);
            }
            return c.json({ msg: "Authorized", data: { username: payload.username, email: payload.email } }, 200);
        }
    )

}

export default new AuthService();