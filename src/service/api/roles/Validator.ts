import { email, z } from "zod";
import { zValidator } from "@hono/zod-validator";

import ValidatorHandler from "@/Configuration/ValidatorHandler";
import { permission } from "process";


class Validator {
    create = zValidator(
        "json",
        z.object({
            rolename: z.string().trim().min(5),
            description: z.string().trim().min(5),
            permissions: z.array(z.number()).optional(),
        }),
        ValidatorHandler
    );

    update = zValidator(
        "json",
        z.object({
            rolename: z.string().trim().min(5).optional(),
            description: z.string().trim().min(5).optional(),
            permissions: z.array(z.number()).optional(),
        }),
        ValidatorHandler
    );  
}

export default new Validator();