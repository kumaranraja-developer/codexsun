// apps/user/user.controller.ts
import {Controller, Request} from "../../../../../cortex/core/controller";
import {UserService} from "./user.service";
import tenantController from "../../tenant/code/tenant.controller";

export class UserController extends Controller<UserService> {

    constructor() {
        const service = new UserService();
        super(service, "/users");
        this.service = service;

        this.use("auth").only(["Store", "Update", "Delete"]);
    }

    protected async indexImpl(req: Request) {
        return this.service.findAll(req.query);
    }

    protected async showImpl(req: Request) {
        return this.service.findByIdOrFail(Number(req.params["id"]));
    }

    protected async storeImpl(req: Request) {
        return this.service.create(req.body);
    }

    protected async updateImpl(req: Request) {
        return this.service.update(Number(req.params["id"]), req.body);
    }

    protected async deleteImpl(req: Request) {
        await this.service.remove(Number(req.params["id"]));
        return {deleted: true};
    }

    protected async countImpl() {
        return this.service.count();
    }

    protected async nextNoImpl() {
        return this.service.nextSequence();
    }
}