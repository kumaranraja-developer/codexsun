// apps/cxsun/core/domain/tenants/tenants.dto.ts
// @ts-ignore
import { z } from 'zod';

export const CreateTenantDto = z.object({
    slug: z.string().min(1).max(62).regex(/^[a-z0-9]([a-z0-9-]{0,60}[a-z0-9])?$/),
    name: z.string().min(1).max(120),
    meta: z.record(z.any()).optional(),
});
export type CreateTenantDto = z.infer<typeof CreateTenantDto>;

export const UpdateTenantDto = z.object({
    name: z.string().min(1).max(120).optional(),
    status: z.enum(['active', 'suspended', 'archived']).optional(),
    meta: z.record(z.any()).nullable().optional(),
    // ETag/version is handled at controller/middleware, but keep type handy:
    version: z.number().int().positive().optional(),
});
export type UpdateTenantDto = z.infer<typeof UpdateTenantDto>;

export const ListTenantsQuery = z.object({
    q: z.string().max(120).optional(),
    status: z.enum(['active', 'suspended', 'archived']).optional(),
    cursor: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
});
export type ListTenantsQuery = z.infer<typeof ListTenantsQuery>;
