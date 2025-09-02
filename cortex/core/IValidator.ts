// cortex/validation/base-validator.ts
export abstract class IValidator<T> {
    abstract validateCreate(data: any): Partial<T>;
    abstract validateUpdate(data: any): Partial<T>;

    protected requireString(field: string, value: any, minLength = 1) {
        if (!value || typeof value !== "string") {
            throw new Error(`${field} is required and must be a string`);
        }
        if (value.length < minLength) {
            throw new Error(`${field} must be at least ${minLength} characters`);
        }
        return value;
    }

    protected optionalString(field: string, value: any, minLength = 1) {
        if (value === undefined) return undefined;
        if (typeof value !== "string") {
            throw new Error(`${field} must be a string`);
        }
        if (value.length < minLength) {
            throw new Error(`${field} must be at least ${minLength} characters`);
        }
        return value;
    }

    protected optionalBoolean(field: string, value: any) {
        if (value === undefined) return undefined;
        return !!value;
    }
}
