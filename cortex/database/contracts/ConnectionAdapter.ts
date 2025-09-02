// ========================= framework/db/ConnectionAdapter.ts =========================
import type { IConnection } from './IConnection';


export class ConnectionAdapter implements IConnection {
    constructor(private readonly raw: any) {}
    execute<T = any>(sql: string, params?: any[]): Promise<T> {
        if (typeof this.raw.execute === 'function') return this.raw.execute(sql, params);
        if (typeof this.raw.query === 'function') return this.raw.query(sql, params);
        throw new Error('No execute/query available on connection');
    }
    async fetchOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
        if (typeof this.raw.fetchOne === 'function') return this.raw.fetchOne(sql, params);
        const r = await this.execute(sql, params);
        const rows = (r?.rows ?? r ?? []) as T[];
        return rows[0] ?? null;
    }
    async fetchAll<T = any>(sql: string, params?: any[]): Promise<T[]> {
        if (typeof this.raw.fetchAll === 'function') return this.raw.fetchAll(sql, params);
        const r = await this.execute(sql, params);
        return (r?.rows ?? r ?? []) as T[];
    }
    async executeMany(sql: string, paramSets: any[][]): Promise<void> {
        if (typeof this.raw.executeMany === 'function') return this.raw.executeMany(sql, paramSets);
        for (const p of paramSets) await this.execute(sql, p);
    }
    begin(): Promise<void> { return this.raw.begin ? this.raw.begin() : this.execute('BEGIN'); }
    commit(): Promise<void> { return this.raw.commit ? this.raw.commit() : this.execute('COMMIT'); }
    rollback(): Promise<void> { return this.raw.rollback ? this.raw.rollback() : this.execute('ROLLBACK'); }
    end?(): Promise<void> { return this.raw.end?.(); }
}