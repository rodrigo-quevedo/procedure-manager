import bcrypt from 'bcrypt';
import { membersDAO } from './members.dao';
import type {
    CreateMemberDTO,
    UpdateMemberDTO,
    MemberResponse,
} from '@pm/shared';

const BCRYPT_ROUNDS = 12;

export class MembersService {
    /**
     * HU-003 – Create a new LEADER/DEVELOPER member under an organization.
     */
    async createMember(
        organizationId: number,
        dto: CreateMemberDTO,
    ): Promise<MemberResponse> {
        const email = dto.email.trim().toLowerCase();
        const fullName = dto.fullName.trim();

        // Duplicate e-mail check
        const taken = await membersDAO.emailExists(email);
        if (taken) {
            throw new Error('El correo electrónico ya se encuentra registrado.');
        }

        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

        const memberId = await membersDAO.createMember({
            organizationId,
            email,
            passwordHash,
            fullName,
            roleCode: dto.role,
        });

        const member = await membersDAO.findById(memberId);
        if (!member) throw new Error('Error inesperado al crear el miembro.');

        return member;
    }

    /**
     * HU-003 – Get all members of an organization.
     */
    async getMembers(organizationId: number): Promise<MemberResponse[]> {
        return membersDAO.findByOrganization(organizationId);
    }

    /**
     * HU-004 – Update an existing member's data.
     */
    async updateMember(
        organizationId: number,
        memberId: number,
        dto: UpdateMemberDTO,
    ): Promise<MemberResponse> {
        // Ownership check
        const owned = await membersDAO.isMemberOf(organizationId, memberId);
        if (!owned) {
            throw new Error('El miembro no pertenece a esta organización.');
        }

        const existing = await membersDAO.findById(memberId);
        if (!existing) throw new Error('Miembro no encontrado.');

        // E-mail uniqueness (if changed)
        const newEmail = dto.email?.trim().toLowerCase();
        if (newEmail && newEmail !== existing.email.toLowerCase()) {
            const taken = await membersDAO.emailExists(newEmail, memberId);
            if (taken) {
                throw new Error('El correo electrónico ya está en uso por otro usuario.');
            }
        }

        // Hash new password if provided
        let passwordHash: string | undefined;
        if (dto.password && dto.password.trim()) {
            passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        }

        await membersDAO.updateMember(memberId, {
            fullName: dto.fullName?.trim(),
            email: newEmail,
            passwordHash,
            roleCode: dto.role,
        });

        const updated = await membersDAO.findById(memberId);
        if (!updated) throw new Error('Error inesperado al actualizar el miembro.');

        return updated;
    }

    /**
     * HU-004 – Enable or disable a member's account.
     */
    async toggleMemberStatus(
        organizationId: number,
        memberId: number,
        isActive: boolean,
    ): Promise<MemberResponse> {
        const owned = await membersDAO.isMemberOf(organizationId, memberId);
        if (!owned) {
            throw new Error('El miembro no pertenece a esta organización.');
        }

        await membersDAO.setActive(memberId, isActive);

        const updated = await membersDAO.findById(memberId);
        if (!updated) throw new Error('Miembro no encontrado.');

        return updated;
    }
}

export const membersService = new MembersService();
