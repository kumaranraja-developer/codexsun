// apps/cxsun/core/tenants/tenants.api.ts

import { Router } from "express";
import TenantController, { TenantMW } from "./tenant.controller";

const r = Router();

// List + read
r.get("/", TenantController.index);
r.get("/:id", TenantMW.idParam, TenantController.show);
r.get("/by-slug/:slug", TenantMW.slugParam, TenantController.showBySlug);

// Create + update + delete
r.post("/", TenantMW.storeBody, TenantController.store);
r.patch("/:id", TenantMW.idParam, TenantMW.updateBody, TenantController.update);
r.delete("/:id", TenantMW.idParam, TenantController.destroy);

export default r;
