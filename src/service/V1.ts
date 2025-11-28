import { Hono } from "hono";
import { describeRoute } from "hono-openapi";

import AuthService from "./api/auth/Service";
import UserService from "./api/users/Service";
import RoleService from "./api/roles/Service";

const api = new Hono().basePath("api");
const auth = new Hono();
const user = new Hono();
const role = new Hono();
auth.get("/me", ...[describeRoute({ tags: ["Auth"], summary: 'Get current user' }), ...AuthService.me]);
auth.post("/login", ...[describeRoute({ tags: ["Auth"], summary: 'User login' }), ...AuthService.login]);
auth.post("/refresh-token", ...[describeRoute({ tags: ["Auth"], summary: 'Refresh token' }), ...AuthService.refreshToken]);
api.route("/v1/auth", auth);

user.get("/", ...[describeRoute({ tags: ["User"],summary: 'Get users'}), ...UserService.index]);
user.get("/2", ...[describeRoute({ tags: ["User"],summary: 'Get users'}), ...UserService.index2]);
user.post("/", ...[describeRoute({ tags: ["User"],summary: 'Create user'}), ...UserService.createUser]);
api.route("/v1/users", user);

role.get("/", ...[describeRoute({ tags: ["Role"],summary: 'Get roles'}), ...RoleService.index]);
role.get("/:id", ...[describeRoute({ tags: ["Role"],summary: 'Get role by ID'}), ...RoleService.getById]);
role.post("/", ...[describeRoute({ tags: ["Role"],summary: 'Create role'}), ...RoleService.create]);
role.put("/:id", ...[describeRoute({ tags: ["Role"],summary: 'Update role'}), ...RoleService.upadate]);
api.route("/v1/roles", role);

export default {
    api
};
