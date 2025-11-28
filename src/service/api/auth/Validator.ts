import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import ValidatorHandler from "@/Configuration/ValidatorHandler";


class Validator {
    login = zValidator(
        "json",
        z.object({
            usernameOrEmail: z.string().trim().min(5),
            password: z.string().min(6),
        }),
        ValidatorHandler
    );
}

export default new Validator();