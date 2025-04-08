
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { loginUser } from "@/api/auth";

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
  login: (username: string, role: UserRole, clientId: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login function with MongoDB authentication
  const login = async (username: string, role: UserRole, clientId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginUser({ username, role, clientId });
      
      if (response.success && response.user) {
        // Store user data and set state
        localStorage.setItem("auth_user", JSON.stringify(response.user));
        setUser(response.user);
        setIsLoading(false);
        return true;
      } else {
        // Set error message
        setError(response.error || response.message || "Authentication failed");
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError("Authentication service unavailable");
      setIsLoading(false);
      return false;
    }
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
    isLoading,
    error
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
