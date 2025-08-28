/**
 * Unified database engine interface for codexsun (cortex/database/Engine.ts)
 */

export type EngineKind = "postgres" | "sqlite" | "mariadb";

export type QueryResult<T = unknown> = { rows: T[] };
export type ExecResult = { changes?: number; lastInsertId?: unknown; affectedRows?: number };

export interface Engine {
    readonly kind: EngineKind;

    query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;

    execute?(sql: string, params?: unknown[]): Promise<ExecResult>;

    close(): Promise<void>;
}
