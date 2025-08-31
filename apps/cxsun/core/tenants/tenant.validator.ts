// cortex/http/validators/tenant.ts
import { v } from "../../../../cortex/carex/validator";

// Create
export const TenantCreateSchema = v.object({
    slug: v.string().min(1).max(190),
    name: v.string().min(1).max(190),
    email: v.string().email().nullable().optional(),
    meta: v.any().nullable().optional(),
    is_active: v.boolean().optional().default(true),
}).strict(); // no unknown keys

export type TenantCreate = ReturnType<typeof TenantCreateSchema["parse"]>;

// Update (slug immutable by default)
export const TenantUpdateSchema = v.object({
    name: v.string().min(1).max(190).optional(),
    email: v.string().email().nullable().optional(),
    meta: v.any().nullable().optional(),
    is_active: v.boolean().optional(),
}).strict();

export type TenantUpdate = ReturnType<typeof TenantUpdateSchema["parse"]>;
