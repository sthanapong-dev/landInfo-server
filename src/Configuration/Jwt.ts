import { sign,verify } from 'hono/jwt'

export default class JwtHandler {
    public signToken(payload: any, algorithm: "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512" | "PS256" | "PS384" | "PS512" | "ES256" | "ES384" | "ES512" | "EdDSA") {
        const secret = process.env.JWT_SECRET as string;
        
        // expire in 1 hour
        payload = {
            ...payload,
            exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
            iat: Math.floor(Date.now() / 1000),  // iat: issued at
        }
        return sign(payload, secret, algorithm);
    }
    public signRefeshToken(payload: any, algorithm: "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512" | "PS256" | "PS384" | "PS512" | "ES256" | "ES384" | "ES512" | "EdDSA") {
        const secret = process.env.JWT_SECRET as string;
        // expire in 1 days
        payload = {
            ...payload,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 1), // 1 days expiration
            iat: Math.floor(Date.now() / 1000),  // iat: issued at
        }
        return sign(payload, secret, algorithm);
    }
    public verifyToken(token: string, secret: string) {
        return verify(token, secret);
    }

}