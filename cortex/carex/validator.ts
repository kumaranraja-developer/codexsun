// cortex/carex/validator.ts
// A tiny, dependency-free validation library with a fluent API.
// Features:
// - Primitive schemas: string, number, boolean, date, object, array, any
// - Modifiers: required, optional, nullable, default
// - Rules: min, max, length, regex, email, int, positive, negative, enum
// - Combinators: refine (custom predicate)
// - Object shape with strict/stripUnknown
// - SafeResult with error flattening
// - Express helpers: validateBody(schema), validateQuery(schema), validateParams(schema)

type Primitive = string | number | boolean | null | undefined | Date | Record<string, unknown> | unknown[];

export type ValidationIssue = {
    path: string; // "user.email" or "items[0].qty"
    code: string; // e.g. "required", "type_error", "min", "email"
    message: string;
};

export type SafeResult<T> =
    | { success: true; data: T }
    | { success: false; errors: ValidationIssue[]; flatten(): Record<string, string[]> };

function typeOf(v: unknown) {
    if (v === null) return "null";
    if (Array.isArray(v)) return "array";
    return typeof v;
}

function isEmail(str: string) {
    // Simple RFC5322-ish check; customize if needed
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function joinPath(base: string, next: string | number) {
    if (typeof next === "number") return `${base}[${next}]`;
    return base ? `${base}.${next}` : next;
}

// ---------------- Schema base ----------------

abstract class BaseSchema<TOut = any> {
    protected _isOptional = false;
    protected _isNullable = false;
    protected _default: (() => any) | undefined;
    protected _refines: Array<{ code: string; message: string; fn: (value: any) => boolean }> = [];

    optional() { this._isOptional = true; return this; }
    nullable() { this._isNullable = true; return this; }
    default(value: any) { this._default = () => (typeof value === "function" ? value() : value); return this; }
    refine(code: string, message: string, fn: (value: any) => boolean) { this._refines.push({ code, message, fn }); return this; }

    // Internal hook for subclasses
    protected abstract _parse(value: unknown, path: string, issues: ValidationIssue[]): any;

    safeParse(value: unknown): SafeResult<TOut> {
        const issues: ValidationIssue[] = [];
        let data = this._parse(value, "", issues);

        // apply refinement rules only if no core issues
        if (issues.length === 0 && data !== undefined) {
            for (const r of this._refines) {
                if (!r.fn(data)) {
                    issues.push({ path: "", code: r.code, message: r.message });
                }
            }
        }

        if (issues.length) {
            const errObj = {
                success: false as const,
                errors: issues,
                flatten() {
                    const map: Record<string, string[]> = {};
                    for (const e of issues) {
                        map[e.path || "_root"] ??= [];
                        map[e.path || "_root"].push(e.message);
                    }
                    return map;
                },
            };
            return errObj;
        }
        return { success: true, data } as any;
    }

    parse(value: unknown): TOut {
        const r = this.safeParse(value);
        if (!r.success) {
            const flat = r.flatten();
            const msg = Object.entries(flat).map(([k, v]) => `${k}: ${v.join(", ")}`).join("; ");
            throw new Error(`ValidationError: ${msg}`);
        }
        return r.data;
    }
}

// ---------------- Primitives ----------------

class AnySchema extends BaseSchema<any> {
    protected _parse(value: unknown, _path: string, _issues: ValidationIssue[]) {
        return value;
    }
}

class StringSchema extends BaseSchema<string | null | undefined> {
    private _min?: number;
    private _max?: number;
    private _len?: number;
    private _regex?: RegExp;
    private _email = false;

    min(n: number) { this._min = n; return this; }
    max(n: number) { this._max = n; return this; }
    length(n: number) { this._len = n; return this; }
    regex(r: RegExp) { this._regex = r; return this; }
    email() { this._email = true; return this; }

    protected _parse(value: unknown, path: string, issues: ValidationIssue[]) {
        if (value === undefined || value === null) {
            if (value === undefined && this._isOptional) return this._default ? this._default() : undefined;
            if (value === null && this._isNullable) return null;
            issues.push({ path, code: "required", message: "Required field" });
            return undefined;
        }
        if (typeof value !== "string") {
            issues.push({ path, code: "type_error", message: "Expected string" });
            return undefined;
        }
        if (this._len !== undefined && value.length !== this._len)
            issues.push({ path, code: "length", message: `Expected length ${this._len}` });
        if (this._min !== undefined && value.length < this._min)
            issues.push({ path, code: "min", message: `Must be at least ${this._min} chars` });
        if (this._max !== undefined && value.length > this._max)
            issues.push({ path, code: "max", message: `Must be at most ${this._max} chars` });
        if (this._regex && !this._regex.test(value))
            issues.push({ path, code: "regex", message: `Invalid format` });
        if (this._email && !isEmail(value))
            issues.push({ path, code: "email", message: `Invalid email` });

        return value;
    }
}

class NumberSchema extends BaseSchema<number | null | undefined> {
    private _int = false;
    private _min?: number;
    private _max?: number;
    private _positive = false;
    private _negative = false;

    int() { this._int = true; return this; }
    min(n: number) { this._min = n; return this; }
    max(n: number) { this._max = n; return this; }
    positive() { this._positive = true; return this; }
    negative() { this._negative = true; return this; }

    protected _parse(value: unknown, path: string, issues: ValidationIssue[]) {
        if (value === undefined || value === null) {
            if (value === undefined && this._isOptional) return this._default ? this._default() : undefined;
            if (value === null && this._isNullable) return null;
            issues.push({ path, code: "required", message: "Required field" });
            return undefined;
        }
        if (typeof value !== "number" || Number.isNaN(value)) {
            issues.push({ path, code: "type_error", message: "Expected number" });
            return undefined;
        }
        if (this._int && !Number.isInteger(value))
            issues.push({ path, code: "int", message: "Expected integer" });
        if (this._min !== undefined && value < this._min)
            issues.push({ path, code: "min", message: `Must be >= ${this._min}` });
        if (this._max !== undefined && value > this._max)
            issues.push({ path, code: "max", message: `Must be <= ${this._max}` });
        if (this._positive && !(value > 0))
            issues.push({ path, code: "positive", message: "Must be > 0" });
        if (this._negative && !(value < 0))
            issues.push({ path, code: "negative", message: "Must be < 0" });

        return value;
    }
}

class BooleanSchema extends BaseSchema<boolean | null | undefined> {
    protected _parse(value: unknown, path: string, issues: ValidationIssue[]) {
        if (value === undefined || value === null) {
            if (value === undefined && this._isOptional) return this._default ? this._default() : undefined;
            if (value === null && this._isNullable) return null;
            issues.push({ path, code: "required", message: "Required field" });
            return undefined;
        }
        if (typeof value !== "boolean") {
            issues.push({ path, code: "type_error", message: "Expected boolean" });
            return undefined;
        }
        return value;
    }
}

class DateSchema extends BaseSchema<Date | null | undefined> {
    protected _parse(value: unknown, path: string, issues: ValidationIssue[]) {
        if (value === undefined || value === null) {
            if (value === undefined && this._isOptional) return this._default ? this._default() : undefined;
            if (value === null && this._isNullable) return null;
            issues.push({ path, code: "required", message: "Required field" });
            return undefined;
        }
        const d = value instanceof Date ? value : new Date(value as any);
        if (Number.isNaN(d.getTime())) {
            issues.push({ path, code: "type_error", message: "Invalid date" });
            return undefined;
        }
        return d;
    }
}

class EnumSchema<T extends string> extends BaseSchema<T> {
    constructor(private values: readonly T[]) { super(); }
    protected _parse(value: unknown, path: string, issues: ValidationIssue[]) {
        if (value === undefined || value === null) {
            if (value === undefined && this._isOptional) return this._default ? this._default() : undefined as any;
            if (value === null && this._isNullable) return null as any;
            issues.push({ path, code: "required", message: "Required field" });
            return undefined;
        }
        if (typeof value !== "string" || !this.values.includes(value as T)) {
            issues.push({ path, code: "enum", message: `Expected one of: ${this.values.join(", ")}` });
            return undefined;
        }
        return value as T;
    }
}

class ArraySchema<T> extends BaseSchema<T[] | null | undefined> {
    private _inner: BaseSchema<T>;
    private _min?: number;
    private _max?: number;

    constructor(inner: BaseSchema<T>) { super(); this._inner = inner; }
    min(n: number) { this._min = n; return this; }
    max(n: number) { this._max = n; return this; }

    protected _parse(value: unknown, path: string, issues: ValidationIssue[]) {
        if (value === undefined || value === null) {
            if (value === undefined && this._isOptional) return this._default ? this._default() : undefined;
            if (value === null && this._isNullable) return null;
            issues.push({ path, code: "required", message: "Required field" });
            return undefined;
        }
        if (!Array.isArray(value)) {
            issues.push({ path, code: "type_error", message: "Expected array" });
            return undefined;
        }
        if (this._min !== undefined && value.length < this._min)
            issues.push({ path, code: "min", message: `Array must have at least ${this._min} items` });
        if (this._max !== undefined && value.length > this._max)
            issues.push({ path, code: "max", message: `Array must have at most ${this._max} items` });

        const out: any[] = [];
        value.forEach((v, i) => {
            const parsed = (this._inner as any)._parse(v, joinPath(path, i), issues);
            out.push(parsed);
        });
        return out as T[];
    }
}

class ObjectSchema<TShape extends Record<string, any>> extends BaseSchema<any> {
    private _shape: { [K in keyof TShape]: BaseSchema<TShape[K]> };
    private _strict = false;
    private _stripUnknown = true;

    constructor(shape: { [K in keyof TShape]: BaseSchema<TShape[K]> }) {
        super(); this._shape = shape as any;
    }

    strict() { this._strict = true; return this; }
    stripUnknown(value = true) { this._stripUnknown = value; return this; }

    protected _parse(value: unknown, path: string, issues: ValidationIssue[]) {
        if (value === undefined || value === null) {
            if (value === undefined && this._isOptional) return this._default ? this._default() : undefined;
            if (value === null && this._isNullable) return null;
            issues.push({ path, code: "required", message: "Required object" });
            return undefined;
        }
        if (typeOf(value) !== "object") {
            issues.push({ path, code: "type_error", message: "Expected object" });
            return undefined;
        }
        const input = value as Record<string, unknown>;
        const out: Record<string, unknown> = {};

        // fields
        for (const key of Object.keys(this._shape)) {
            const parsed = (this._shape as any)[key]._parse(input[key], joinPath(path, key), issues);
            if (parsed !== undefined) out[key] = parsed;
            else if ((this._shape as any)[key]._default) out[key] = (this._shape as any)[key]._default();
        }

        // unknown keys
        if (this._strict) {
            for (const key of Object.keys(input)) {
                if (!(key in this._shape)) {
                    issues.push({ path: joinPath(path, key), code: "unknown_key", message: "Unknown key" });
                }
            }
        } else if (!this._stripUnknown) {
            for (const key of Object.keys(input)) {
                if (!(key in this._shape)) out[key] = input[key];
            }
        }

        return out;
    }
}

// ---------------- Factory API ----------------

export const v = {
    any: () => new AnySchema(),
    string: () => new StringSchema(),
    number: () => new NumberSchema(),
    boolean: () => new BooleanSchema(),
    date: () => new DateSchema(),
    enum: <T extends string>(values: readonly T[]) => new EnumSchema<T>(values),
    array: <T>(inner: BaseSchema<T>) => new ArraySchema<T>(inner),
    object: <T extends Record<string, any>>(shape: { [K in keyof T]: BaseSchema<T[K]> }) => new ObjectSchema<T>(shape),
};

// ---------------- Express helpers ----------------

import type { Request, Response, NextFunction } from "express";

export function validateBody<T>(schema: BaseSchema<T>) {
    return function (req: Request, res: Response, next: NextFunction) {
        const r = schema.safeParse(req.body);
        if (!r.success) return res.status(422).json({ errors: r.flatten() });
        (req as any).validated = (req as any).validated ?? {};
        (req as any).validated.body = r.data;
        next();
    };
}

export function validateQuery<T>(schema: BaseSchema<T>) {
    return function (req: Request, res: Response, next: NextFunction) {
        const r = schema.safeParse(req.query);
        if (!r.success) return res.status(422).json({ errors: r.flatten() });
        (req as any).validated = (req as any).validated ?? {};
        (req as any).validated.query = r.data;
        next();
    };
}

export function validateParams<T>(schema: BaseSchema<T>) {
    return function (req: Request, res: Response, next: NextFunction) {
        const r = schema.safeParse(req.params);
        if (!r.success) return res.status(422).json({ errors: r.flatten() });
        (req as any).validated = (req as any).validated ?? {};
        (req as any).validated.params = r.data;
        next();
    };
}
