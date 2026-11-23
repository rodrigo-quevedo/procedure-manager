import { projectsDAO } from './projects.dao';
import { membersDAO } from '../members/members.dao';
import type {
    CreateProjectDTO,
    UpdateProjectDTO,
    ProjectDetailResponse,
    RoleCode,
} from '@pm/shared';

export class ProjectsService {
    async getProjects(
        organizationId: number,
        userId: number,
        userRole: RoleCode,
    ): Promise<ProjectDetailResponse[]> {
        const allProjects = await projectsDAO.findByOrganization(organizationId);

        if (userRole === 'ORGANIZATION') {
            return allProjects;
        }

        // Leader or Developer sees projects where they are assigned, plus PUBLIC projects if applicable
        return allProjects.filter((p) => {
            const isAssigned = p.leaderIds.includes(userId) || p.memberIds.includes(userId);
            return isAssigned || p.confidentialityLevel === 'PUBLIC';
        });
    }

    async getProjectById(
        projectId: number,
        organizationId: number,
        userId: number,
        userRole: RoleCode,
    ): Promise<ProjectDetailResponse> {
        const project = await projectsDAO.findById(projectId);
        if (!project || project.idOrganization !== organizationId) {
            throw new Error('Proyecto no encontrado.');
        }

        if (userRole !== 'ORGANIZATION') {
            const isAssigned = project.leaderIds.includes(userId) || project.memberIds.includes(userId);
            if (!isAssigned && project.confidentialityLevel !== 'PUBLIC') {
                throw new Error('No tienes acceso a este proyecto.');
            }
        }

        return project;
    }

    async createProject(
        organizationId: number,
        creatorId: number,
        creatorRole: RoleCode,
        dto: CreateProjectDTO,
    ): Promise<ProjectDetailResponse> {
        const name = dto.name?.trim();
        if (!name || name.length < 3) {
            throw new Error('El nombre del proyecto debe tener al menos 3 caracteres.');
        }

        if (!dto.confidentialityLevel || !['PUBLIC', 'PRIVATE'].includes(dto.confidentialityLevel)) {
            throw new Error('Nivel de confidencialidad inválido.');
        }

        let leaderIds = [...new Set(dto.leaderIds || [])];
        let memberIds = [...new Set(dto.memberIds || [])];

        if (creatorRole === 'LEADER' && !leaderIds.includes(creatorId)) {
            leaderIds.push(creatorId);
        }

        // Leaders take priority over members
        memberIds = memberIds.filter((id) => !leaderIds.includes(id));

        if (creatorRole === 'ORGANIZATION' && leaderIds.length === 0) {
            throw new Error('Debes seleccionar al menos un Líder.');
        }

        // Validate that all assigned members belong to this organization
        const allAssignedIds = [...leaderIds, ...memberIds];
        for (const memberId of allAssignedIds) {
            const isMember = await membersDAO.isMemberOf(organizationId, memberId);
            if (!isMember) {
                throw new Error(`El usuario con ID ${memberId} no pertenece a esta organización.`);
            }
        }
        console.log("Service activado. Llamando al DAO.")
        const projectId = await projectsDAO.createProject({
            organizationId,
            creatorId,
            name,
            confidentialityLevel: dto.confidentialityLevel,
            assignedMemberIds: allAssignedIds,
        });

        const created = await projectsDAO.findById(projectId);
        if (!created) throw new Error('Error al recuperar el proyecto creado.');

        return created;
    }

    async updateProject(
        projectId: number,
        organizationId: number,
        userId: number,
        userRole: RoleCode,
        dto: UpdateProjectDTO,
    ): Promise<ProjectDetailResponse> {
        const existing = await projectsDAO.findById(projectId);
        if (!existing || existing.idOrganization !== organizationId) {
            throw new Error('Proyecto no encontrado.');
        }

        const canEdit =
            userRole === 'ORGANIZATION' ||
            (userRole === 'LEADER' && existing.leaderIds.includes(userId));

        if (!canEdit) {
            throw new Error('No tienes permisos para editar este proyecto.');
        }

        const name = dto.name !== undefined ? dto.name.trim() : undefined;
        if (name !== undefined && name.length < 3) {
            throw new Error('El nombre del proyecto debe tener al menos 3 caracteres.');
        }

        let assignedMemberIds: number[] | undefined;
        if (dto.leaderIds !== undefined || dto.memberIds !== undefined) {
            let leaderIds = dto.leaderIds !== undefined ? [...new Set(dto.leaderIds)] : existing.leaderIds;
            let memberIds = dto.memberIds !== undefined ? [...new Set(dto.memberIds)] : existing.memberIds;

            if (userRole === 'LEADER') {
                const staysAssigned = leaderIds.includes(userId) || memberIds.includes(userId);
                if (!staysAssigned) {
                    throw new Error('Debes permanecer asignado al proyecto.');
                }
            }

            memberIds = memberIds.filter((id) => !leaderIds.includes(id));

            if (userRole === 'ORGANIZATION' && leaderIds.length === 0) {
                throw new Error('Debes seleccionar al menos un Líder.');
            }

            assignedMemberIds = [...leaderIds, ...memberIds];

            for (const memberId of assignedMemberIds) {
                const isMember = await membersDAO.isMemberOf(organizationId, memberId);
                if (!isMember) {
                    throw new Error(`El usuario con ID ${memberId} no pertenece a esta organización.`);
                }
            }
        }

        await projectsDAO.updateProject(projectId, {
            name,
            confidentialityLevel: dto.confidentialityLevel,
            assignedMemberIds,
        });

        const updated = await projectsDAO.findById(projectId);
        if (!updated) throw new Error('Error al actualizar el proyecto.');

        return updated;
    }
}

export const projectsService = new ProjectsService();
