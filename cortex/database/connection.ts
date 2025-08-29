// Thin façade for app code.
// Default profile: 'default'. Blue analytics: 'BLUE'. Dev sandbox: 'SANDBOX'.
import * as cm from './connection_manager';

export type Profile = 'default' | 'BLUE' | 'SANDBOX' | (string & {});

export async function Connection(profile: Profile = 'default') {
    await cm.prepareEngine(profile);
    return {
        Engine: () => cm.getEngine(profile),
        GetConnection: () => cm.getConnection(profile),
        Close: () => cm.closeEngine(profile),

        Query: (sql: string, params?: unknown) => cm.execute(profile, sql, params),
        FetchOne: <T = any>(sql: string, params?: unknown) => cm.fetchOne<T>(profile, sql, params),
        FetchAll: <T = any>(sql: string, params?: unknown) => cm.fetchAll<T>(profile, sql, params),
        ExecuteMany: (sql: string, sets: unknown[]) => cm.executeMany(profile, sql, sets),

        Begin: () => cm.begin(profile),
        Commit: () => cm.commit(profile),
        Rollback: () => cm.rollback(profile),

        Healthz: () => cm.healthz(profile),
    };
}

// Convenience singletons for common profiles
export const Default = () => Connection('default');
export const Blue    = () => Connection('BLUE');
export const Sandbox = () => Connection('SANDBOX');
