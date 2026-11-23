import { Request, Response } from 'express';
import { membersService } from './members.service';
import type { CreateMemberDTO, UpdateMemberDTO } from '@pm/shared';

// ---------------------------------------------------------------------------
// Helper: extract organization ID from the JWT payload attached by authMiddleware
// ---------------------------------------------------------------------------

/** Reads the authenticated user's numeric ID from res.locals (set by authMiddleware). */
const getOrganizationId = (res: Response): number => {
    const orgId = res.locals.userId as number | undefined;
    if (!orgId) throw new Error('No autenticado.');
    return orgId;
};

const badRequest = (res: Response, message: string): void => {
    res.status(400).json({ message });
};

const serverError = (res: Response, err: unknown): void => {
    console.error('[MembersController]', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
};

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

export class MembersController {
    /**
     * GET /api/members
     * Returns all members of the authenticated organization.
     */
    async getMembers(req: Request, res: Response): Promise<void> {
        try {
            const orgId = getOrganizationId(res);
            const members = await membersService.getMembers(orgId);
            res.status(200).json(members);
        } catch (err) {
            serverError(res, err);
        }
    }

    /**
     * POST /api/members
     * Creates a new LEADER/DEVELOPER under the authenticated organization.
     *
     * Body: CreateMemberDTO
     */
    async createMember(req: Request, res: Response): Promise<void> {
        const { fullName, email, password, role } =
            req.body as Partial<CreateMemberDTO>;

        if (!fullName?.trim()) {
            badRequest(res, 'El nombre completo es obligatorio.');
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
        if (!role || !['LEADER', 'DEVELOPER'].includes(role)) {
            badRequest(res, 'El rol debe ser LEADER o DEVELOPER.');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        if (!passwordRegex.test(password)) {
            badRequest(
                res,
                'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.',
            );
            return;
        }

        try {
            const orgId = getOrganizationId(res);
            const member = await membersService.createMember(orgId, { fullName, email, password, role });
            res.status(201).json(member);
        } catch (err) {
            if (err instanceof Error) {
                res.status(409).json({ message: err.message });
            } else {
                serverError(res, err);
            }
        }
    }

    /**
     * PATCH /api/members/:id
     * Updates fullName, email, password and/or role of a member.
     *
     * Body: UpdateMemberDTO
     */
    async updateMember(req: Request, res: Response): Promise<void> {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const memberId = parseInt(idParam ?? '', 10);
        if (isNaN(memberId)) {
            badRequest(res, 'ID de miembro inválido.');
            return;
        }

        const { fullName, email, password, role } =
            req.body as Partial<UpdateMemberDTO>;

        if (role && !['LEADER', 'DEVELOPER'].includes(role)) {
            badRequest(res, 'El rol debe ser LEADER o DEVELOPER.');
            return;
        }

        if (password && password.trim()) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
            if (!passwordRegex.test(password)) {
                badRequest(
                    res,
                    'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.',
                );
                return;
            }
        }

        try {
            const orgId = getOrganizationId(res);
            const updated = await membersService.updateMember(orgId, memberId, { fullName, email, password, role });
            res.status(200).json(updated);
        } catch (err) {
            if (err instanceof Error) {
                res.status(400).json({ message: err.message });
            } else {
                serverError(res, err);
            }
        }
    }

    /**
     * PATCH /api/members/:id/status
     * Enables or disables a member account.
     *
     * Body: { isActive: boolean }
     */
    async toggleStatus(req: Request, res: Response): Promise<void> {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const memberId = parseInt(idParam ?? '', 10);
        if (isNaN(memberId)) {
            badRequest(res, 'ID de miembro inválido.');
            return;
        }

        const { isActive } = req.body as { isActive?: boolean };
        if (typeof isActive !== 'boolean') {
            badRequest(res, 'El campo isActive (boolean) es obligatorio.');
            return;
        }

        try {
            const orgId = getOrganizationId(res);
            const updated = await membersService.toggleMemberStatus(orgId, memberId, isActive);
            res.status(200).json(updated);
        } catch (err) {
            if (err instanceof Error) {
                res.status(400).json({ message: err.message });
            } else {
                serverError(res, err);
            }
        }
    }
}

export const membersController = new MembersController();
