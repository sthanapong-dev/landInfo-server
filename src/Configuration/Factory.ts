import { Context, Next } from "hono";
import { createFactory } from "hono/factory";
import { verify } from "hono/jwt";
import { getCookie } from "hono/cookie";
import dayjs from "dayjs";

export default class Factory {
    public factory: ReturnType<typeof createFactory> = createFactory();

    public log = this.factory.createMiddleware(async (c: Context, next: Next) => {
        console.log("Request received");
        await next();
    });

    public verify = this.factory.createMiddleware(async (c: Context, next: Next) => {
        try {
            // read cookie
            const tokenFromCookie = getCookie(c, "x-token");
            let tokenFromHeader = c.req.header('Authorization') || '';
            tokenFromHeader = tokenFromHeader.replace(/^Bearer\s+/i, '');

            if (tokenFromCookie === undefined && !tokenFromHeader) {
                return c.json({ status: false, errors: ["Unauthorized"] }, 401)
            }
            const token = tokenFromCookie || tokenFromHeader;
            const decoded: any = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString() || '{}');
            const now = dayjs().unix() + 30;

            if (typeof decoded.exp === 'number' && decoded.exp < now) {
                return c.json({ status: false, errors: ['Token expired'] }, 401);
            }
            let payload: any;
            try {
                payload = await verify(token, process.env.JWT_SECRET || '', 'HS256');
            } catch {
                return c.json({ status: false, errors: ['Unauthorized'] }, 401);
            }

            c.set('jwtPayload', payload);

        } catch (error) {
            console.error("Error verifying token:", error);
            return c.json({ status: false, errors: ["Unauthorized"] }, 401)
        } 
        await next();
    });

    public async permission(c: Context, next: Next) {
        await next();
    }


}