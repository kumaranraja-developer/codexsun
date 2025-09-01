// apps/cxsun/src/tenants/Tenant.list.tsx
import React from "react";
import { useEffect, useState } from "react";

type Tenant = {
    id: number;
    slug: string;
    name: string;
    email: string | null;
    is_active: boolean;
    created_at: string;
};

export default function TenantList() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/tenants")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch tenants");
                return res.json();
            })
            .then(setTenants)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading tenants...</p>;
    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

    return (
        <div>
            <h2>Tenant List</h2>
            <table border={1} cellPadding={8} style={{ borderCollapse: "collapse" }}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Slug</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Active</th>
                    <th>Created</th>
                </tr>
                </thead>
                <tbody>
                {tenants.map((t) => (
                    <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>{t.slug}</td>
                        <td>{t.name}</td>
                        <td>{t.email ?? "-"}</td>
                        <td>{t.is_active ? "✅" : "❌"}</td>
                        <td>{new Date(t.created_at).toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
