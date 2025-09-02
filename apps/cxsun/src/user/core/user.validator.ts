// apps/cxsun/src/user/user.validator.ts
import { IValidator, strType, boolType, emailType, hashedType } from "../../../../../cortex/core/IValidator";

export interface UserCreateInput {
    name: strType;
    email: emailType;
    password?: hashedType;
    is_active: boolType;
}
export interface UserUpdateInput {
    name?: strType;
    email?: emailType;
    password?: hashedType;
    is_active?: boolType;
}

export class UserValidator extends IValidator<UserCreateInput, UserUpdateInput> {
    validateCreate(data: any): UserCreateInput {
        return {
            name: this.requireString("Name", data?.name) as strType,
            email: this.requireEmail("Email", data?.email),
            password: this.optionalHashedPassword("Password", data?.password, 6),
            is_active: (typeof data?.is_active === "boolean" ? data.is_active : true) as boolType,
        };
    }

    validateUpdate(data: any): UserUpdateInput {
        return {
            name: this.optionalString("Name", data?.name) as strType | undefined,
            email: this.optionalEmail("Email", data?.email),
            password: this.optionalHashedPassword("Password", data?.password, 6),
            is_active: this.optionalBoolean("is_active", data?.is_active) as boolType | undefined,
        };
    }
}
