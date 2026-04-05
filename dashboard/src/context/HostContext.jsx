import { createContext, useState } from "react";

export const HostContext = createContext();

/* -----------------------------------------------------------
   User → API-mode map
   Bryan  → relative URLs  (via Nginx proxy, apiBase = "")
   John, Sheryl, Eric → absolute URLs (apiBase = "http://host:5000")
   All passwords: "admin"
----------------------------------------------------------- */
const USERS = {
  bryan:  { password: "admin", mode: "relative" },
  john:   { password: "admin", mode: "absolute" },
  sheryl: { password: "admin", mode: "absolute" },
  eric:   { password: "admin", mode: "absolute" },
};

export const HostProvider = ({ children }) => {
  const [currentHost, setCurrentHost] = useState(null);
  const [theme, setTheme] = useState('dark-mode');

  // Auth + API base state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [apiBase, setApiBase] = useState("");          // "" = relative

  const login = (user, pass) => {
    const key = user.trim().toLowerCase();
    const entry = USERS[key];

    if (!entry || entry.password !== pass) {
      return { success: false, error: "Invalid username or password." };
    }

    const base = entry.mode === "absolute"
      ? `http://${window.location.hostname}:5000`
      : "";

    setUsername(user.trim());
    setApiBase(base);
    setIsLoggedIn(true);
    return { success: true };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setApiBase("");
    setCurrentHost(null);
  };

  return (
    <HostContext.Provider value={{
      currentHost, setCurrentHost,
      theme, setTheme,
      isLoggedIn, username, apiBase,
      login, logout,
    }}>
      {children}
    </HostContext.Provider>
  );
};
