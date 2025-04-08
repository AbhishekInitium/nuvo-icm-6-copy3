
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "@/api/client";
import { toast } from "@/hooks/use-toast";

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
  login: (username: string, password: string, role: UserRole, clientId: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check for existing user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login function
  const login = async (username: string, password: string, role: UserRole, clientId: string) => {
    setIsLoading(true);
    
    try {
      // For MongoDB validation path
      const response = await authApi.login(username, password, clientId);
      
      // If we get here, authentication was successful
      const authUser = { 
        username, 
        role: response.role || role, // Use role from server if available
        clientId 
      };
      
      localStorage.setItem("auth_user", JSON.stringify(authUser));
      setUser(authUser);
      setIsLoading(false);
      
      return true;
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      // Show error message from server or fallback
      const errorMessage = error.response?.data?.message || "Authentication failed";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
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
