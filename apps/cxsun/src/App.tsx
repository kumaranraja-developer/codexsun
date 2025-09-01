import { useState } from "react";

export default function App() {
    const [tenants] = useState<any[]>([]);

    return (
        <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
            <h1>Codexsun</h1>
            <h2>Tenants</h2>
            <ul>
                {tenants.map((t) => (
                    <li key={t.id}>
                        <code>{t.slug}</code> — {t.name}
                    </li>
                ))}
            </ul>
        </main>
    );
}
