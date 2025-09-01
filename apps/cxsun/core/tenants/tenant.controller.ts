import { Request, Response } from "express";
import { TenantRepo } from "./tenant.repo";
import { TenantCreateSchema, TenantUpdateSchema } from "./tenant.validator";
import { validateBody, validateParams, v } from "../../../../cortex/carex/validator";

// Reusable param validators
const IdParamSchema = v.object({ id: v.string() }).strict();
const SlugParamSchema = v.object({ slug: v.string() }).strict();

// Export middlewares so routes can attach them
export const TenantMW = {
    idParam: validateParams(IdParamSchema),
    slugParam: validateParams(SlugParamSchema),
    storeBody: validateBody(TenantCreateSchema),
    updateBody: validateBody(TenantUpdateSchema),
};

export default class TenantController {
    /** GET /api/tenants?limit=&offset= */
    static async index(req: Request, res: Response) {
        try {
            const limit = Math.min(Number(req.query.limit ?? 50), 200);
            const offset = Math.max(Number(req.query.offset ?? 0), 0);
            const rows = await TenantRepo.all(limit, offset);
            res.json({ data: rows, meta: { limit, offset, count: rows.length } });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    /** GET /api/tenants/:id */
    static async show(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const row = await TenantRepo.findById(id);
            if (!row) return res.status(404).json({ error: "Tenant not found" });
            res.json({ data: row });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    /** GET /api/tenants/by-slug/:slug */
    static async showBySlug(req: Request, res: Response) {
        try {
            const row = await TenantRepo.findBySlug(req.params.slug);
            if (!row) return res.status(404).json({ error: "Tenant not found" });
            res.json({ data: row });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    /** POST /api/tenants */
    static async store(req: Request, res: Response) {
        try {
            // body already validated by middleware
            const body = (req as any).validated.body;

            // simple uniqueness pre-check for slug; DB still enforces
            const exists = await TenantRepo.findBySlug(body.slug);
            if (exists) return res.status(409).json({ error: "Slug already exists" });

            const created = await TenantRepo.create(body);
            res.status(201).json({ data: created });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    /** PATCH /api/tenants/:id */
    static async update(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const body = (req as any).validated.body;
            const updated = await TenantRepo.update(id, body);
            if (!updated) return res.status(404).json({ error: "Tenant not found" });
            res.json({ data: updated });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    /** DELETE /api/tenants/:id (soft delete) */
    static async destroy(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            await TenantRepo.softDelete(id);
            res.status(204).send();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
