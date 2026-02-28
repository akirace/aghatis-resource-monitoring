import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'aghatis-resource-monitor-secret-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface AuthPayload {
    username: string;
    iat?: number;
    exp?: number;
}

export async function signToken(payload: AuthPayload): Promise<string> {
    return await new SignJWT({ username: payload.username })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('8h')
        .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);
        const username = payload.username;
        if (typeof username !== 'string') return null;
        return {
            username,
            iat: typeof payload.iat === 'number' ? payload.iat : undefined,
            exp: typeof payload.exp === 'number' ? payload.exp : undefined,
        };
    } catch {
        return null;
    }
}
