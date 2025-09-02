// ============================= framework/db/IConnection.ts =============================
export interface IConnection {
    execute<T = any>(sql: string, params?: any[]): Promise<T>;
    fetchOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
    fetchAll<T = any>(sql: string, params?: any[]): Promise<T[]>;
    executeMany(sql: string, paramSets: any[][]): Promise<void>;
    begin(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    end?(): Promise<void>;
}