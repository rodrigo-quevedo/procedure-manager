import { Request, Response } from 'express';
import { authService } from './auth.service';
import type { RegisterOrganizationDTO, LoginCredentialsDTO } from '@pm/shared';

// ---------------------------------------------------------------------------
// Controller helpers
// ---------------------------------------------------------------------------

/** Sends a 400 Bad Request with a JSON `{ message }` body. */
const badRequest = (res: Response, message: string): void => {
    res.status(400).json({ message });
};

/** Sends a 500 Internal Server Error. Only the generic message goes to the client. */
const serverError = (res: Response, err: unknown): void => {
    console.error('[AuthController] Unexpected error:', err);
    res.status(500).json({ message: 'Error interno del servidor. Intenta de nuevo más tarde.' });
};

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

export class AuthController {
    /**
     * POST /api/auth/register
     *
     * Body: RegisterOrganizationDTO
     * Response 201: AuthTokenResponse
     */
    async register(req: Request, res: Response): Promise<void> {
        const { organizationName, email, password, confirmPassword } =
            req.body as Partial<RegisterOrganizationDTO>;

        // --- Basic input validation ---
        if (!organizationName?.trim()) {
            badRequest(res, 'El nombre de la organización es obligatorio.');
            return;
        }
        if (!email?.trim()) {
            badRequest(res, 'El correo electrónico es obligatorio.');
            return;
        }
        if (!password) {
            badRequest(res, 'La contraseña es obligatoria.');
            return;
        }
        if (confirmPassword !== undefined && password !== confirmPassword) {
            badRequest(res, 'Las contraseñas no coinciden.');
            return;
        }

        // --- Password strength (mirror the client-side rules) ---
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        if (!passwordRegex.test(password)) {
            badRequest(
                res,
                'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.',
            );
            return;
        }

        try {
            const result = await authService.registerOrganization({ organizationName, email, password });
            res.status(201).json(result);
        } catch (err) {
            if (err instanceof Error) {
                // Business-rule errors (duplicate email, etc.)
                res.status(409).json({ message: err.message });
            } else {
                serverError(res, err);
            }
        }
    }

    /**
     * POST /api/auth/login
     *
     * Body: LoginCredentialsDTO
     * Response 200: AuthTokenResponse
     */
    async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body as Partial<LoginCredentialsDTO>;

        if (!email?.trim()) {
            badRequest(res, 'El correo electrónico es obligatorio.');
            return;
        }
        if (!password) {
            badRequest(res, 'La contraseña es obligatoria.');
            return;
        }

        try {
            const result = await authService.login({ email, password });
            res.status(200).json(result);
        } catch (err) {
            if (err instanceof Error) {
                res.status(401).json({ message: err.message });
            } else {
                serverError(res, err);
            }
        }
    }
}

// Singleton
export const authController = new AuthController();
