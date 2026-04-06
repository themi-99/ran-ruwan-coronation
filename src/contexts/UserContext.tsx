import { createContext, useContext, useState, ReactNode } from "react";

export interface UserProfile {
  nic: string;
  full_name: string;
  gender: string | null;
  branch: string | null;
  is_admin: boolean | null;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem("rr_user");
    return stored ? JSON.parse(stored) : null;
  });

  const handleSetUser = (u: UserProfile | null) => {
    setUser(u);
    if (u) localStorage.setItem("rr_user", JSON.stringify(u));
    else localStorage.removeItem("rr_user");
  };

  const logout = () => handleSetUser(null);

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be within UserProvider");
  return ctx;
};
