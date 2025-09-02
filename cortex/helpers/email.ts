// ===================================== helpers/email.ts =====================================
export const normalizeEmail = (e: string | null | undefined) => (e ? e.trim().toLowerCase() : null);