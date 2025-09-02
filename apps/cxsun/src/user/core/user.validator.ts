// apps/user/user.validator.ts
import { User } from "./user.model";
import { IValidator } from "../../../../../cortex/core/IValidator";

export class UserValidator extends IValidator<User> {
    validateCreate(data: any): Partial<User> {
        return {
            name: this.requireString("Name", data.name),
            email: this.requireString("Email", data.email),
            password: this.optionalString("Password", data.password, 6),
            is_active: data.is_active ?? true,
        };
    }

    validateUpdate(data: any): Partial<User> {
        return {
            name: this.optionalString("Name", data.name),
            email: this.optionalString("Email", data.email),
            password: this.optionalString("Password", data.password, 6),
            is_active: this.optionalBoolean("is_active", data.is_active),
        };
    }
}
