// cortex/migration/Blueprint.ts
//
// Base schema DSL + abstract engine hooks that return SQL strings,
// matching Builder.buildCreateTable() expectations.
//
// Exports:
//  - TableBuilder, ColumnSpec, ConstraintSpec, ColumnKind, Dialect, TableDefFn
//  - Blueprint (abstract base), BaseBlueprint (alias), TableBlueprint (legacy alias)

export type Dialect = 'postgres' | 'mariadb' | 'mysql' | 'sqlite';

export type ColumnKind =
    | 'boolean'
    | 'char' | 'string' | 'text' | 'tinyText' | 'mediumText' | 'longText'
    | 'id' | 'increments' | 'bigIncrements' | 'mediumIncrements' | 'smallIncrements' | 'tinyIncrements'
    | 'integer' | 'bigInteger' | 'mediumInteger' | 'smallInteger' | 'tinyInteger'
    | 'unsignedBigInteger' | 'unsignedInteger' | 'unsignedMediumInteger' | 'unsignedSmallInteger' | 'unsignedTinyInteger'
    | 'decimal' | 'double' | 'float'
    | 'dateTime' | 'dateTimeTz' | 'date' | 'time' | 'timeTz'
    | 'timestamp' | 'timestamps' | 'timestampsTz'
    | 'softDeletes' | 'softDeletesTz' | 'year'
    | 'binary' | 'blob'
    | 'json' | 'jsonb'
    | 'uuid' | 'ulid'
    | 'uuidMorphs' | 'ulidMorphs' | 'nullableUuidMorphs' | 'nullableUlidMorphs'
    | 'geography' | 'geometry'
    | 'foreignId' | 'foreignIdFor' | 'foreignUlid' | 'foreignUuid'
    | 'morphs' | 'nullableMorphs'
    | 'enum' | 'set' | 'macAddress' | 'ipAddress' | 'rememberToken' | 'vector'
    | 'slug' | 'version' | 'active';

export interface ColumnSpec {
    kind: ColumnKind;
    name?: string;
    params?: Record<string, any>;
    notnull?: boolean;
    nullable?: boolean;
    unique?: boolean | string;
    default?: string | number | boolean | null;
    references?: {
        table: string;
        column?: string;
        onDelete?: 'NO ACTION' | 'RESTRICT' | 'CASCADE' | 'SET NULL';
        onUpdate?: 'NO ACTION' | 'RESTRICT' | 'CASCADE' | 'SET NULL';
    };
    index?: { name?: string; unique?: boolean };
}

export interface ConstraintSpec {
    type: 'unique' | 'index';
    name?: string;
    cols: string[];
    unique?: boolean;
}

export class TableBuilder {
    name: string;
    columns: ColumnSpec[] = [];
    constraints: ConstraintSpec[] = [];
    constructor(name: string) { this.name = name; }

    private add(kind: ColumnKind, name?: string, params?: any) {
        this.columns.push({ kind, name, params });
        return this._colApi(name);
    }

    // Boolean
    boolean(name: string) { return this.add('boolean', name); }

    // String & Text
    char(name: string, length: number = 255) { return this.add('char', name, { length }); }
    string(name: string, length: number = 255) { return this.add('string', name, { length }); }
    text(name: string) { return this.add('text', name); }
    tinyText(name: string) { return this.add('tinyText', name); }
    mediumText(name: string) { return this.add('mediumText', name); }
    longText(name: string) { return this.add('longText', name); }

    // Numeric
    id(name: string = 'id') { return this.add('id', name); }
    increments(name: string = 'id') { return this.add('increments', name); }
    bigIncrements(name: string = 'id') { return this.add('bigIncrements', name); }
    mediumIncrements(name: string) { return this.add('mediumIncrements', name); }
    smallIncrements(name: string) { return this.add('smallIncrements', name); }
    tinyIncrements(name: string) { return this.add('tinyIncrements', name); }
    integer(name: string) { return this.add('integer', name); }
    bigInteger(name: string) { return this.add('bigInteger', name); }
    mediumInteger(name: string) { return this.add('mediumInteger', name); }
    smallInteger(name: string) { return this.add('smallInteger', name); }
    tinyInteger(name: string) { return this.add('tinyInteger', name); }
    unsignedBigInteger(name: string) { return this.add('unsignedBigInteger', name); }
    unsignedInteger(name: string) { return this.add('unsignedInteger', name); }
    unsignedMediumInteger(name: string) { return this.add('unsignedMediumInteger', name); }
    unsignedSmallInteger(name: string) { return this.add('unsignedSmallInteger', name); }
    unsignedTinyInteger(name: string) { return this.add('unsignedTinyInteger', name); }
    decimal(name: string, precision: number = 8, scale: number = 2) { return this.add('decimal', name, { precision, scale }); }
    double(name: string, precision: number = 8, scale: number = 2) { return this.add('double', name, { precision, scale }); }
    float(name: string, precision: number = 8, scale: number = 2) { return this.add('float', name, { precision, scale }); }

    // Date & Time
    dateTime(name: string) { return this.add('dateTime', name); }
    dateTimeTz(name: string) { return this.add('dateTimeTz', name); }
    date(name: string) { return this.add('date', name); }
    time(name: string) { return this.add('time', name); }
    timeTz(name: string) { return this.add('timeTz', name); }
    timestamp(name: string) { return this.add('timestamp', name); }
    timestamps() { return this.add('timestamps'); }
    timestampsTz() { return this.add('timestampsTz'); }
    softDeletes(name: string = 'deletedAt') { return this.add('softDeletes', name); }
    softDeletesTz(name: string = 'deletedAt') { return this.add('softDeletesTz', name); }
    year(name: string) { return this.add('year', name); }

    // Binary
    binary(name: string) { return this.add('binary', name); }
    blob(name: string) { return this.add('blob', name); }

    // JSON
    json(name: string) { return this.add('json', name); }
    jsonb(name: string) { return this.add('jsonb', name); }

    // UUID & ULID
    uuid(name: string) { return this.add('uuid', name); }
    ulid(name: string) { return this.add('ulid', name); }
    uuidMorphs(name: string) { return this.add('uuidMorphs', name); }
    ulidMorphs(name: string) { return this.add('ulidMorphs', name); }
    nullableUuidMorphs(name: string) { return this.add('nullableUuidMorphs', name); }
    nullableUlidMorphs(name: string) { return this.add('nullableUlidMorphs', name); }

    // Spatial
    geography(name: string) { return this.add('geography', name); }
    geometry(name: string) { return this.add('geometry', name); }

    // Relationships
    foreignId(name: string) { return this.add('foreignId', name); }
    foreignIdFor(name: string) { return this.add('foreignIdFor', name); }
    foreignUlid(name: string) { return this.add('foreignUlid', name); }
    foreignUuid(name: string) { return this.add('foreignUuid', name); }
    morphs(name: string) { return this.add('morphs', name); }
    nullableMorphs(name: string) { return this.add('nullableMorphs', name); }

    // Specialty
    enum(name: string, values: string[]) { return this.add('enum', name, { values }); }
    set(name: string, values: string[]) { return this.add('set', name, { values }); }
    macAddress(name: string) { return this.add('macAddress', name); }
    ipAddress(name: string) { return this.add('ipAddress', name); }
    rememberToken(name: string = 'rememberToken') { return this.add('rememberToken', name); }
    vector(name: string) { return this.add('vector', name); }

    // Conveniences
    slug(name: string = 'slug') { return this.add('slug', name); }
    version(name: string = 'version') { return this.add('version', name); }
    active(name: string = 'active_id') { return this.add('active', name); }

    // Table constraints
    unique(cols: string[], name?: string) { this.constraints.push({ type: 'unique', cols, name, unique: true }); return this; }
    index(cols: string[], name?: string, unique: boolean = false) { this.constraints.push({ type: 'index', cols, name, unique }); return this; }

    // Column chain API
    private _colApi = (name?: string) => {
        const find = () => this.columns.find(c => c.name === name)!;
        const api = {
            notnull: () => { const c = find(); c.notnull = true; c.nullable = false; return api; },
            nullable: () => { const c = find(); c.nullable = true; c.notnull = false; return api; },
            unique: (idxName?: string) => { const c = find(); c.unique = idxName || true; return api; },
            default: (val: any) => { const c = find(); c.default = val; return api; },
            references: (
                table: string,
                column: string = 'id',
                onDelete?: NonNullable<ColumnSpec['references']>['onDelete'],
                onUpdate?: NonNullable<ColumnSpec['references']>['onUpdate'],
            ) => { const c = find(); c.references = { table, column, onDelete, onUpdate }; return api; },
            index: (idxName?: string, unique?: boolean) => { const c = find(); c.index = { name: idxName, unique }; return api; },
        };
        return api;
    };
}

export type TableDefFn = (table: TableBuilder) => void;

export interface BuiltTableLike {
    name: string;
    columns: ColumnSpec[];
    constraints: ConstraintSpec[];
}

// NOTE: abstract base; engines must implement buildCreate/buildDrop to return SQL strings
export abstract class Blueprint {
    tableName: string;
    table: TableBuilder;

    constructor(name: string = 'default') {
        this.tableName = name;
        this.table = new TableBuilder(name);
    }

    build(fn: TableDefFn) { fn(this.table); return this; }

    reset(name?: string) {
        if (name) { this.tableName = name; }
        this.table = new TableBuilder(this.tableName);
        return this;
    }

    protected buildPayload(def?: TableDefFn): BuiltTableLike {
        if (def) { this.reset(); this.build(def); }
        return {
            name: this.tableName,
            columns: this.table.columns,
            constraints: this.table.constraints,
        };
    }

    abstract buildCreate(def?: TableDefFn): string;
    abstract buildDrop(): string;
}

// Back-compat exports
export { Blueprint as BaseBlueprint };
export class TableBlueprint extends Blueprint {
    constructor(name: string = 'default') { super(name); }
    buildCreate(): string { throw new Error('TableBlueprint is abstract; use a dialect-specific blueprint'); }
    buildDrop(): string { return `DROP TABLE IF NOT EXISTS \`${this.tableName}\`;`; }
}
