import { createContext, useState, useEffect, useContext } from "react";

import type { ReactNode } from "react";

// Define the shape of the context data
interface SettingsContextType {
  serverUrl: string;
  setServerUrl: (url: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

// Create the context with a default value
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

// Create the provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize serverUrl from localStorage or default to an empty string
  const [serverUrl, setServerUrlState] = useState<string>(() => {
    return localStorage.getItem("serverUrl") || "";
  });

  // Function to update the URL in both state and localStorage
  const setServerUrl = (url: string) => {
    // Add http:// if no protocol is present for convenience
    let formattedUrl = url;
    if (url && !/^https?:\/\//i.test(url)) {
      formattedUrl = `http://${url}`;
    }
    localStorage.setItem("serverUrl", formattedUrl);
    setServerUrlState(formattedUrl);
  };

  return (
    <SettingsContext.Provider
      value={{ serverUrl, setServerUrl, isSettingsOpen, setIsSettingsOpen }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
