// utils/groupBy.ts
export function groupBy<T extends Record<string, any>, K extends keyof T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = item[key] || "General"; // <-- default if no section
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}
