# Análisis de Migración: tipos locales → shared/types

## Resumen de divergencias

### Auth types (shared/types/auth.ts vs client feature-local)

| Concepto | Cliente actual | shared/types |
|---|---|---|
| `User.id` | `string` | `number` |
| `User.name` | `name: string` | `fullName: string` |
| `User.role` | `'ORGANIZACION'|'LIDER'|'DESARROLLADOR'` | `'ORGANIZATION'|'LEADER'|'DEVELOPER'` |
| `User.organizationId` | `string` (existe) | ❌ no existe |
| `User.password` | `string` (existe) | `passwordHash?: string` |
| `Organization` | existe local | ❌ no existe en shared |
| `AuthSession` | `{user, organization}` | `{user, token, refreshToken?, expiresAt}` |
| `LoginDTO` | `{email, password}` | `LoginCredentialsDTO {email, password}` |
| `RegisterOrganizationDTO` | existe | existe (igual estructura) |

### Project types (shared/types/projects.ts vs client feature-local)

| Concepto | Cliente actual | shared/types |
|---|---|---|
| `Project.id` | `string` | `number` |
| `Project.organizationId` | `string` | `idOrganization: number` |
| `Project.confidentiality` | `ConfidentialityLevel` | `confidentialityLevel: ConfidentialityLevel` |
| `Project.leaderIds` | `string[]` | ❌ no existe |
| `Project.memberIds` | `string[]` | ❌ no existe (→ `ProjectMember` join table) |
| `Project.createdBy` | `string` | `idCreator: number` |
| `Project.updatedAt` | `string` | ❌ no existe |
| `CreateProjectDTO` | local type | existe en shared (diferente) |

## Estrategia de Migración

Dado que `shared/types` define el contrato real del backend (DB-first),
la migración implica:

1. **Adaptar tipos locales del cliente** para extender/mapear desde shared
2. **Mantener compatibilidad temporal** con la capa de storage mock
3. **Crear tipos de cliente enriquecidos** que añadan campos de UI sobre la base shared

### Decisión de diseño

- Los tipos `shared/types` son el **source of truth**
- El cliente necesita **tipos locales extendidos** para los campos de UI/mock
  (ej: `password`, `organizationId`, `leaderIds`, `memberIds`, `updatedAt`)
- Se crea un módulo `client/src/types/client.ts` con extensiones locales
- Cada feature re-exporta desde shared y añade sus extensiones locales

## Archivos a modificar

### Nuevos archivos
- `client/src/types/index.ts` — re-exports from shared + client extensions

### Archivos de tipos a eliminar/reemplazar
- `client/src/features/auth/types.ts` → reemplazar con import desde shared
- `client/src/features/projects/types.ts` → reemplazar con import desde shared
- `client/src/features/members/types.ts` → reemplazar con import desde shared

### Archivos de código a actualizar
- Todos los que importan `from '../types'` o `from '@/features/auth/types'`


Analyzed migration-analysis.md:L1-60

Aquí el resumen ejecutivo del progreso logrado:

---

## ✅ Progreso: Migración `client/src` → `shared/types`

### Completado

| Archivo | Estado |
|---|---|
| `client/tsconfig.json` | ✅ Alias `@shared/*` → `../shared/*` agregado |
| `features/auth/types.ts` | ✅ Re-exporta tipos shared; agrega `ClientRoleCode`, `ClientUser` (alias `User`), `Organization`, `AuthSession` |
| `features/projects/types.ts` | ✅ Re-exporta `ConfidentialityLevel`, `Project`, `ProjectMember`, `CreateProjectDTO` desde shared; agrega `ClientProject`, `ProjectAssignmentInput` |
| `features/members/types.ts` | ✅ Re-exporta `RoleCode`, `ROLE_LABELS` desde shared; agrega `MemberRole`, `CreateMemberDTO`, `UpdateMemberDTO` |
| `services/storage.ts` | ✅ Usa `ClientUser` / `ClientProject`; re-exporta como `User`/`Project` para compatibilidad |
| `features/projects/api/` | ✅ `createProject`, `getProjects`, `updateProject` adaptados a `ClientProject`/`ClientUser` |
| `features/projects/utils/` | ✅ `search.ts` y `validateProject.ts` actualizados |
| `features/projects/components/ProjectForm.tsx` | ✅ Importa desde `@/features/auth/types` |
| `features/procedures/types/index.ts` | ℹ️ Ya autónomo (no requería migración) |

### Pendiente / No iniciado

| Área | Qué falta |
|---|---|
| `components/MemberDashboard.tsx`, `OrganizationDashboard.tsx` | Revisar imports de tipos |
| `features/members/components/` | Verificar que usen `MemberRole`/`CreateMemberDTO` del nuevo `types.ts` |
| `features/auth/components/` (LoginForm, RegisterForm) | Verificar imports post-migración |
| `features/procedure_executions/types/index.ts` | Aún no migrado a shared |
| `examples/` | Varios ejemplos no revisados |
| **TypeScript check** | `npx tsc --noEmit` no ejecutado aún |

> **Próximo paso clave:** revisar los componentes restantes y correr el type-check. ¿Continúo con eso?

## 🚀 Sugerencias para continuar

### Prioridad 1 — Verificación rápida
```bash
cd client && npx tsc --noEmit 2>&1
```
Muestra todos los errores de tipos de una sola vez. **Empezar aquí** evita buscar problemas a ciegas.

---

### Prioridad 2 — Componentes pendientes (en orden de impacto)

1. **`features/auth/components/`** — `LoginForm.tsx` y `RegisterForm.tsx` usan `LoginDTO`; confirmar que importen desde `@/features/auth/types`.

2. **`features/members/components/`** — `MemberForm`, `MemberList`, `MemberDetail` probablemente aún usen un `User` o `role` sin refactorizar.

3. **`components/OrganizationDashboard.tsx` / `MemberDashboard.tsx`** — Dashboards raíz que probablemente pasen `User` y `Project` como props; verificar compatibilidad.

---

### Prioridad 3 — Tipos faltantes

| Módulo | Acción sugerida |
|---|---|
| `procedure_executions/types/index.ts` | Migrar a usar tipos de `shared/types/executions` |
| `features/auth/types/index.ts` | Unificar con `auth/types.ts` (hay duplicado potencial) |

---

### Prioridad 4 — Cierre

- Remover archivos `types/index.ts` que queden vacíos/duplicados (`auth/types/`, `members/types/`, `projects/types/`)
- Probar el dev server: `pnpm --filter client dev`

---

> **Recomendación:** ejecuta el type-check primero y comparte la salida; así puedo atacar exactamente los errores reales sin suposiciones. ¿Quieres que lo hagamos ahora?