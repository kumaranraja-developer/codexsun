// apps/cxsun/core/domain/tenants/Tenant.model.ts

export type TenantStatus = 'active' | 'suspended' | 'archived';

export interface TenantProps {
    id: string;          // uuid (from DB)
    slug: string;        // unique, lowercased
    name: string;
    status: TenantStatus;
    meta: Record<string, unknown> | null;
    version: number;     // optimistic concurrency
    createdAt: Date;
    updatedAt: Date;
}

export class Tenant implements TenantProps {
    id!: string;
    slug!: string;
    name!: string;
    status!: TenantStatus;
    meta!: Record<string, unknown> | null;
    version!: number;
    createdAt!: Date;
    updatedAt!: Date;

    static normalizeSlug(input: string) {
        return input.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    }

    static initial(props: Pick<TenantProps, 'slug' | 'name' | 'meta'>): Omit<TenantProps, 'id' | 'createdAt' | 'updatedAt'> {
        return {
            slug: Tenant.normalizeSlug(props.slug),
            name: props.name.trim(),
            status: 'active',
            meta: props.meta ?? null,
            version: 1,
        } as Omit<TenantProps, 'id' | 'createdAt' | 'updatedAt'>;
    }
}
