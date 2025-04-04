
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth, UserRole } from "@/contexts/AuthContext";

// Mock client IDs
const MOCK_CLIENT_IDS = ["ACME-001", "Globex-002", "Initech-003", "Umbrella-004", "Cyberdyne-005"];

export default function Login() {
  const { isAuthenticated, login, user } = useAuth();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("Manager");
  const [clientId, setClientId] = useState(MOCK_CLIENT_IDS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      login(username, role, clientId);
      setIsSubmitting(false);
    }, 500);
  };

  // Redirect if user is already authenticated
  if (isAuthenticated) {
    // Redirect based on role
    if (user?.role === "Admin") return <Navigate to="/kpi-configurator" replace />;
    if (user?.role === "Manager") return <Navigate to="/schemes" replace />;
    if (user?.role === "Agent") return <Navigate to="/agent-dashboard" replace />;
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
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isSubmitting || !username}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
