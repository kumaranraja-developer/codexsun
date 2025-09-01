import React from "react";
import ReactDOM from "react-dom/client";
import "../theme.css";
import {BrowserRouter} from "react-router-dom";
import settings from "../public/settings.json";
import AppRoutes from "./Routes";
import {AppProvider} from "../../../apps/global/AppContaxt";
import {AuthProvider} from "../../../apps/global/auth/AuthContext";
import AppInitializer from "../../../apps/global/useSettings";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AppProvider initialSettings={settings}>
                <AuthProvider> {/* ✅ Add this wrapper */}
                    <AppInitializer>
                        <AppRoutes/>
                    </AppInitializer>
                </AuthProvider>
            </AppProvider>
        </BrowserRouter>
    </React.StrictMode>
);
