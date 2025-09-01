// AppContext.tsx
import React from "react";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type Settings = {
  theme: string;
  recordsPerPage: number;
  // Add more fields as needed
};

type AppContextType = {
  currentComponent: string;
  setCurrentComponent: (name: string) => void;

  settings: Settings | null;
  updateSettings: (newSettings: Partial<Settings>) => void;
  APP_TYPE: string;
  API_URL: string;
  API_METHOD: string;
};

// const APP_TYPE = import.meta.env.VITE_APP_TYPE || 'CODEXSUN';

// const env = import.meta.env;
const APP_TYPE = "ERP";
const API_URL = "https://demo.codexsun.com/";
const API_METHOD = "FRAPPE";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({
  children,
  initialSettings,
}: {
  children: ReactNode;
  initialSettings: Settings;
}) => {
  const [currentComponent, setCurrentComponent] = useState("");
  const [settings, setSettings] = useState<Settings | null>(initialSettings);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("user_settings", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentComponent,
        setCurrentComponent,
        settings,
        updateSettings,
        APP_TYPE,
        API_URL,
        API_METHOD
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
