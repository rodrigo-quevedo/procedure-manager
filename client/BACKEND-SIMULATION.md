# Backend Simulation (Client‑side)

## Overview
The project does **not** have a real SQL server. All data is stored in the browser’s **`localStorage`** and the logic for accessing it is centralized in a small utility module. This module mimics a simple backend by providing CRUD‑style functions that read/write JSON strings to `localStorage`.

## Where the data lives
| Location | What it contains | Comment |
|----------|------------------|----------|
| **`localStorage`** (browser domain) | JSON string with an array of objects (or a single object) | Persists across page reloads, but only in the user’s browser. No physical file in the repository. |
| **Keys used (defined in `storage.ts`)** | - `pm_organizations`<br>- `pm_users`<br>- `currentUser`<br>- `currentOrganization` | Each key stores a JSON payload that represents a “table” or a session record. |

The implementation lives in **[`storage.ts`](file:///C:/Users/Usuario/Downloads/tesis/codigo/procedure-manager/client/src/services/storage.ts)** and the data‑shape definitions are in **[`types/index.ts`](file:///C:/Users/Usuario/Downloads/tesis/codigo/procedure-manager/client/src/features/auth/types/index.ts)**.

## Simulated tables
| Simulated table | Type (from `types/index.ts`) | Fields |
|-----------------|-----------------------------|--------|
| **`organizations`** | `Organization` | `id`, `name`, `createdAt` |
| **`users`** | `User` | `id`, `organizationId`, `name`, `email`, `password?`, `role`, `isActive`, `createdAt`, `failedLoginAttempts?` |
| **`current_user`** | `User \| null` | Full `User` object or `null` |
| **`current_organization`** | `Organization \| null` | Full `Organization` object or `null` |

### Type definitions (excerpt)
```ts
export type Role = 'ORGANIZACION' | 'LIDER' | 'DESARROLLADOR';

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  failedLoginAttempts?: number;
}
```

## Typical data flow
1. **Read** – `storage.getOrganizations()` parses the JSON stored under `pm_organizations` and returns an array of `Organization` objects.
2. **Write** – `storage.saveOrganization(org)` reads the current array, updates or appends the record, then writes the new JSON back to `localStorage`.
3. **Session handling** – `storage.setCurrentUser(user)` and `storage.setCurrentOrganization(org)` store the logged‑in user / active organization under the `currentUser` and `currentOrganization` keys.

All operations use `JSON.stringify` / `JSON.parse` wrapped by the helper `safeParse` to guard against malformed data.

## Quick summary for the team
- **Location**: data lives in the browser’s `localStorage`, not on disk.
- **“Tables”**: simulated collections `organizations` and `users`, plus two singleton records for the current session.
- **Central code**: `client/src/services/storage.ts` (CRUD helpers) and type definitions in `client/src/features/auth/types/index.ts`.
- **Persistence**: clearing browser cache or switching domains erases the stored data.
- **Future migration**: swapping the calls in `storage.*` for real HTTP requests will turn this mock into a genuine backend with minimal refactoring.

---
*This file documents the current client‑side data‑persistence strategy, useful when planning a future backend implementation.*
