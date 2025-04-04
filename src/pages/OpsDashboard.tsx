
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchemesApprovalTab } from '@/components/ops/SchemesApprovalTab';
import { RunHistoryTab } from '@/components/ops/RunHistoryTab';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function OpsDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("approval");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    // Check if user has appropriate role
    if (user?.role === 'Finance' || user?.role === 'Manager') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [user]);

  if (!isAuthorized) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Unauthorized Access</AlertTitle>
        <AlertDescription>
          You don't have permission to access the Finance & Ops Portal.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Finance & Ops Portal</h1>
        <p className="text-muted-foreground mt-2">
          Manage scheme approvals and review production runs
        </p>
      </header>

      <Tabs defaultValue="approval" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="approval">Schemes Pending Approval</TabsTrigger>
          <TabsTrigger value="runs">Run History</TabsTrigger>
        </TabsList>
        <TabsContent value="approval">
          <SchemesApprovalTab />
        </TabsContent>
        <TabsContent value="runs">
          <RunHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
