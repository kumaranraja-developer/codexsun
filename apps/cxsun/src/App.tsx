// apps/cxsun/src/App.tsx
import { Route, Routes, Navigate } from "react-router-dom";
import TenantList from "./tenant/view/Tenant.list";
import React from "react";
import Admin from "./tenant/view/Admin";
import Login from "../../../resources/global/auth/Login";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "../../../resources/global/AppContaxt";
import { AuthProvider } from "../../../resources/global/auth/frappeAuthContext";
import settings from "../json/settings.json";
import AppInitializer from "../../../resources/global/useSettings";
import { ThemeProvider } from "../../../resources/global/theme-provider";
export default function App() {
  return (
      <ThemeProvider defaultTheme="light"> {/* for theme light/dark */}
        <BrowserRouter>
          <AppProvider initialSettings={settings}> {/* base settings from json */}
            <AuthProvider> {/* for auth user login or not check protected route */}
              <AppInitializer>  {/* initial settings from json like logo, company name etc... */}
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/dashboard/:component?" element={<Admin />} />
                  <Route path="/tenants" element={<TenantList />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppInitializer>
            </AuthProvider>
          </AppProvider>
        </BrowserRouter>
      </ThemeProvider>
  );
}
