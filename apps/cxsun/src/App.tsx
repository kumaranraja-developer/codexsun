// apps/cxsun/src/App.tsx
import { Link, Route, Routes, Navigate } from "react-router-dom";
import TenantList from "../core/tenant/Tenant.list";
import React from "react";

export default function App() {
    return (
        <div style={{ padding: 16 }}>
            <header style={{ marginBottom: 16 }}>
                <nav style={{ display: "flex", gap: 12 }}>
                    <Link to="/">Home</Link>
                    <Link to="/tenants">Tenants</Link>
                </nav>
            </header>

            <Routes>
                <Route path="/" element={<div>Welcome 👋</div>} />
                <Route path="/tenants" element={<TenantList />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}
