import { email, z } from "zod";
import { zValidator } from "@hono/zod-validator";

import ValidatorHandler from "@/Configuration/ValidatorHandler";


class Validator {
    createUser = zValidator(
        "json",
        z.object({
            username: z.string().trim().min(5),
            email: z.string().email(),
            password: z.string().min(6),
            name: z.string().trim().min(5),
        }),
        ValidatorHandler
    );
}

export default new Validator();