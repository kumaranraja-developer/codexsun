// ============================== framework/db/Dialect.ts ==============================
export abstract class Dialect {
    abstract name: 'postgres' | 'mysql' | 'sqlite';


    /** Placeholder for a given index (1-based for pg, ? for others) */
    abstract ph(i: number): string;


    /** Concatenate two SQL string expressions. */
    abstract concat(a: string, b: string): string;


    /** SQL NOW()/CURRENT_TIMESTAMP expr */
    abstract now(): string;


    /** DDL for users table */
    abstract ddlUsers(table: string, tenantTable?: string): string[];


    /** Resolve insert id from driver result or fallback query */
    abstract getInsertId(result: any, conn: import('./IConnection').IConnection): Promise<number>;


    /** LIMIT/OFFSET clause */
    limitOffset(limit?: number, offset?: number): string {
        const parts: string[] = [];
        if (typeof limit === 'number') parts.push(`LIMIT ${limit}`);
        if (typeof offset === 'number') parts.push(`OFFSET ${offset}`);
        return parts.join(' ');
    }
}