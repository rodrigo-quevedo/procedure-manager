import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '@pm/shared';

/**
 * Express middleware that validates the Bearer JWT in the Authorization header.
 * On success it populates res.locals with:
 *   - userId  (number) – the user's numeric primary key
 *   - email   (string)
 *   - role    (RoleCode)
 */
export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Token de autenticación requerido.' });
        return;
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        res.status(500).json({ message: 'Configuración de servidor incompleta.' });
        return;
    }

    try {
        const payload = jwt.verify(token, secret) as unknown as JWTPayload;
        res.locals.userId = payload.sub;
        res.locals.email  = payload.email;
        res.locals.role   = payload.role;
        next();
    } catch {
        res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};
