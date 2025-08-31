// cortex/carex/Model.ts
export abstract class Model {
    abstract id: number;

    /** hasMany relation (1 -> many) */
    protected hasMany<T extends Model>(related: new () => T, foreignKey: string) {
        return { type: "hasMany", related, foreignKey };
    }

    /** belongsTo relation (many -> 1) */
    protected belongsTo<T extends Model>(related: new () => T, foreignKey: string) {
        return { type: "belongsTo", related, foreignKey };
    }

    // 🚀 Extend later with query builder, timestamps, softDeletes, scopes...
}
