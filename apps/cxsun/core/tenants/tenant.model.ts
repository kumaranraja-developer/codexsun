// cortex/Models/tenant.model.ts
import { Model } from "../../../../cortex/carex/Model";

export class Tenant extends Model {
    id!: number;
    slug:string;
    name!: string;
    email!: string | null;
    meta: Record<string, unknown> | null;
    isActive!: boolean;
    created_at!: Date;
    updated_at!: Date;
    deleted_at!: Date;
}
