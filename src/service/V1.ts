import { Hono } from "hono";
import { describeRoute } from "hono-openapi";

import AuthService from "./api/auth/Service";
import UserService from "./api/users/Service";

const api = new Hono().basePath("api");
const auth = new Hono();
const user = new Hono();

auth.get("/me", ...[describeRoute({ tags: ["Auth"], summary: 'Get current user' }), ...AuthService.me]);
auth.post("/login", ...[describeRoute({ tags: ["Auth"], summary: 'User login' }), ...AuthService.login]);
api.route("/v1/auth", auth);

user.get("/", ...[describeRoute({ tags: ["User"],summary: 'Get users'}), ...UserService.index]);
user.post("/", ...[describeRoute({ tags: ["User"],summary: 'Create user'}), ...UserService.createUser]);

api.route("/v1/users", user);


export default {
    api
};
