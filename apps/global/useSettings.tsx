import React from "react";
import {
  useEffect,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useAppContext } from "./AppContaxt";
import LoadingSpinner from "../../resources/components/loading/LoadingSpinner";
import LoadingScreen from "../../resources/components/loading/LoadingScreen";

const SettingsContext = createContext<any>(null);

export function useAppSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within AppInitializer");
  }
  return context;
}

export default function AppInitializer({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<any>(null);
  const { APP_TYPE } = useAppContext();

  useEffect(() => {
    if (!APP_TYPE) return;

    let jsonPath = "../../json/settings.json";

    const loadSettings = async () => {
      try {
        const res = await fetch(jsonPath);
        if (!res.ok) {
          throw new Error(
            `Failed to load settings: ${res.status} ${res.statusText}`
          );
        }
        const data = await res.json();
        // console.debug("[AppInitializer] Settings loaded successfully:", data);
        setSettings(data);
      } catch (error) {
        console.error("[AppInitializer] Error loading settings:", error);
      }
    };

    loadSettings();
  }, [APP_TYPE]);

  if (!APP_TYPE) {
    return (
      <div className="flex items-center justify-center h-screen w-screen text-red-600 text-lg font-semibold">
        Missing APP_TYPE environment variable
      </div>
    );
  }
  if (!settings) {
    return <LoadingScreen image={"/assets/logo/logicx_logo.svg"} />;
  }

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}
