// cortex/migration/Builder.ts
import type { DBConfig, DBDriver } from '../database/types';
import { getDbConfig } from '../database/getDbConfig';

import { SqliteBlueprint }   from './blueprint/sqlite';
import { MariadbBlueprint }  from './blueprint/mariadb';
import { PostgresBlueprint } from './blueprint/postgres';
import type { TableBlueprint } from './Blueprint';

// What a migration file exports as its default
export type TableDef = (table: TableBlueprint) => void;

export interface BuildResult {
    name: string;
    content: string;
}

/** Pick the right blueprint by driver. */
function getBlueprint(driver: DBDriver): TableBlueprint {
    switch (driver) {
        case 'sqlite':   return new SqliteBlueprint();
        case 'mariadb':  return new MariadbBlueprint();
        case 'postgres': return new PostgresBlueprint();
        default:
            // TS safety; at runtime we'll never get here if DBDriver is correct.
            // Still, throw a clean error if misconfigured.
            throw new Error(`Unsupported driver: ${String(driver)}`);
    }
}

/**
 * Builder
 * - Reads DBConfig (same source as connection_manager)
 * - Switches blueprint by cfg.driver
 * - Returns SQL content strings
 */
export class Builder {
    private cfg: DBConfig;

    /**
     * You can optionally pass a profile (e.g. 'default' | 'BLUE' | 'SANDBOX') to mirror
     * connection_manager usage; falls back to 'default'.
     */
    constructor(profile: string = 'default') {
        this.cfg = getDbConfig(profile);
        if (!this.cfg?.driver) {
            throw new Error('Builder: getDbConfig() returned no driver. Check your DB_* env.');
        }
    }

    /** Create-table SQL from a migration table def. */
    buildCreateTable(tableName: string, def: TableDef, p0: { file: string; }): BuildResult {
        const blueprint = getBlueprint(this.cfg.driver);
        blueprint.reset(tableName);   // ensure clean state per table
        def(blueprint);               // let the migration file define columns + modifiers
        return {
            name: tableName,
            content: blueprint.buildCreate(),
        };
    }

    /** Drop-table SQL (no def needed). */
    buildDropTable(tableName: string): BuildResult {
        const blueprint = getBlueprint(this.cfg.driver);
        blueprint.reset(tableName);
        return {
            name: tableName,
            content: blueprint.buildDrop(),
        };
    }
}

/**
 * Helper API for migration files, matching what Runner expects:
 *
 *   export default defineTable("tenants", (t) => { ... })
 */
export function defineTable(tableName: string, def: TableDef) {
    return { tableName, def };
}
export default Builder;
