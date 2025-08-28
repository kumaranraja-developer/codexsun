/**
 *  cortex/connection.ts
 *
 * centric connection manager
 */

export type QueryResult<T = any> = { rows: T[] };
export type ExecResult = { changes?: number };

export type EngineKind = "sqlite" | "pg" | "mariadb";

export interface Engine {
    kind: EngineKind;
    query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
    execute?(sql: string, params?: any[]): Promise<ExecResult>;
    close(): Promise<void>;
}
