import { createContext, useState } from "react";

export const HostContext = createContext();

export const HostProvider = ({ children }) => {
  const [currentHost, setCurrentHost] = useState(null);
  const [theme, setTheme] = useState('dark-mode');

  // Auth + API base state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [apiBase, setApiBase] = useState("");          // "" = relative

  const login = async (user, pass) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.trim().toLowerCase(), password: pass }),
      });

      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error || "Invalid username or password." };
      }

      const base = data.mode === "absolute"
        ? `http://${window.location.hostname}:5000`
        : "";

      setUsername(user.trim());
      setApiBase(base);
      setIsLoggedIn(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Unable to reach authentication server." };
    }
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
