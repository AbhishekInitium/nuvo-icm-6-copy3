
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Define user roles
export type UserRole = "Admin" | "Manager" | "Agent" | "Finance";

// Define auth user interface
interface AuthUser {
  username: string;
  role: UserRole;
  clientId: string;
}

// Define auth context interface
interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, role: UserRole, clientId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Check for existing user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login function
  const login = (username: string, role: UserRole, clientId: string) => {
    const authUser = { username, role, clientId };
    localStorage.setItem("auth_user", JSON.stringify(authUser));
    setUser(authUser);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  // Auth context value
  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
