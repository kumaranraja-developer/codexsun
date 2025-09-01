// apps/cxsun/src/App.tsx
import { Link, Route, Routes, Navigate } from "react-router-dom";
import TenantList from "./tenant/view/Tenant.list";
import React from "react";
import Admin from "./tenant/view/Admin";
import Login from '../../global/auth/Login'
export default function App() {
    return (
        <div style={{ padding: 16 }}>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard/:component?" element={<Admin />} />
                <Route path="/tenants" element={<TenantList />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}
