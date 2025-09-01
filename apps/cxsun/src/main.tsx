import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./App";
import "./theme.css";
import {BrowserRouter} from "react-router-dom";
import {AppProvider} from "../../global/AppContaxt";
import {AuthProvider} from "../../global/auth/frappeAuthContext";
import settings from "../json/settings.json";
import AppInitializer from "../../global/useSettings";
import {ThemeProvider} from "../../../resources/components/theme-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeProvider defaultTheme="light">
            <BrowserRouter>
            <AppProvider initialSettings={settings}>
                <AuthProvider> {/* ✅ Add this wrapper */}
                    <AppInitializer>
                        <AppRoutes/>
                    </AppInitializer>
                </AuthProvider>
            </AppProvider>
        </BrowserRouter>
        </ThemeProvider>

    </React.StrictMode>
);
