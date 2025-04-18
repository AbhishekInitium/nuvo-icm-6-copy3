
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Mock client IDs
const MOCK_CLIENT_IDS = ["NUVO_01", "Globex-002", "Initech-003", "Umbrella-004", "Cyberdyne-005"];

export default function Login() {
  const { isAuthenticated, login, user, isLoading, error } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("Manager");
  const [clientId, setClientId] = useState(MOCK_CLIENT_IDS[0]);
  const [localError, setLocalError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    console.log('Login form submitted:', { username, role, clientId });
    
    const success = await login(username, role, clientId);
    
    console.log('Login result:', { success, error });
    
    if (!success) {
      const errorMessage = error || "Authentication failed. Please check your credentials.";
      setLocalError(errorMessage);
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Redirect if user is already authenticated
  if (isAuthenticated) {
    console.log('User is authenticated, redirecting based on role:', user?.role);
    // Redirect based on role
    if (user?.role === "Admin") return <Navigate to="/kpi-configurator" replace />;
    if (user?.role === "Agent") return <Navigate to="/agent-dashboard" replace />;
    if (user?.role === "Finance") return <Navigate to="/finance-ops" replace />;
    return <Navigate to="/schemes" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">NUVO ICM Manager</CardTitle>
          <CardDescription className="text-center">
            Sign in to access the incentive management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Administrator</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Agent">Agent</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Select 
                value={clientId} 
                onValueChange={setClientId}
              >
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CLIENT_IDS.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {localError && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                {localError}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isLoading || !username}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
