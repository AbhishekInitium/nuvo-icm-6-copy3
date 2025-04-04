
import { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircularProgress } from "@/components/dashboard/CircularProgress";
import { BookingsChart } from "@/components/dashboard/BookingsChart";
import { RecentBookingsTable } from "@/components/dashboard/RecentBookingsTable";
import { TopPerformers } from "@/components/dashboard/TopPerformers";
import { PaymentSummary } from "@/components/dashboard/PaymentSummary";
import { agentApi } from "@/api/agent";
import { Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AgentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [currentScheme, setCurrentScheme] = useState<any>(null);

  // Mock data for the dashboard
  const agentProfile = {
    name: user?.username || "Agent Name",
    id: "AGT-" + (user?.clientId || "12345").slice(-5),
    baseSalary: 75000,
    totalIncentive: 24500,
    avatar: undefined, // Could add a real image URL here
  };

  const bookingsData = [
    { month: "January", bookings: 68000, quota: 65000 },
    { month: "February", bookings: 72500, quota: 65000 },
    { month: "March", bookings: 98500, quota: 75000 },
    { month: "April", bookings: 42500, quota: 75000 },
  ];

  const recentBookings = [
    { id: "ORD-7523", product: "Enterprise Suite", value: 15750.50, date: new Date("2025-04-03") },
    { id: "ORD-7498", product: "Security Module", value: 8320.75, date: new Date("2025-04-01") },
    { id: "ORD-7456", product: "Cloud Infrastructure", value: 12500.00, date: new Date("2025-03-28") },
    { id: "ORD-7421", product: "Analytics Platform", value: 9800.25, date: new Date("2025-03-25") },
    { id: "ORD-7395", product: "Integration Services", value: 6750.00, date: new Date("2025-03-22") },
  ];

  const topPerformers = [
    { id: "1", name: "Sarah Johnson", value: 145000, image: undefined },
    { id: "2", name: "Michael Chen", value: 132500, image: undefined },
    { id: "3", name: "Emma Davis", value: 128750, image: undefined },
    { id: "4", name: user?.username || "Current Agent", value: 109500, image: undefined },
    { id: "5", name: "David Lee", value: 98000, image: undefined },
  ];

  const paymentSummary = {
    currentEarnings: 3850.75,
    priorBalance: 750.25,
    totalPayout: 4601.00,
  };

  const quotaAttainment = {
    current: 42500,
    target: 75000,
    attainmentPercent: Math.round((42500 / 75000) * 100),
  };

  // Fetch agent schemes on component mount
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Use the user's ID from auth context
        const agentId = user.username;
        
        // Fetch schemes
        const schemes = await agentApi.getAgentSchemes(agentId);
        setSchemes(schemes);
        
        // If schemes exist, fetch the most recent one
        if (schemes.length > 0) {
          const latestScheme = schemes[0];
          const schemeResult = await agentApi.getAgentResultForScheme(
            latestScheme.schemeId,
            agentId
          );
          setCurrentScheme(schemeResult);
        }
      } catch (err) {
        console.error('Error fetching agent data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgentData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {agentProfile.name}. Here's your performance overview.
        </p>
      </div>

      {/* Profile and Summary Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={agentProfile.avatar} />
                <AvatarFallback className="text-lg">
                  {agentProfile.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-semibold">{agentProfile.name}</p>
                <p className="text-sm text-muted-foreground">ID: {agentProfile.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-sm text-muted-foreground">Base Salary</p>
                <p className="text-xl font-semibold">
                  ${agentProfile.baseSalary.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total TIC</p>
                <p className="text-xl font-semibold text-primary">
                  ${agentProfile.totalIncentive.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quota Attainment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Quota Attainment</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[180px]">
            <CircularProgress 
              value={quotaAttainment.current} 
              max={quotaAttainment.target} 
              label={`$${quotaAttainment.current.toLocaleString()} of $${quotaAttainment.target.toLocaleString()}`} 
            />
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <PaymentSummary 
            currentEarnings={paymentSummary.currentEarnings}
            priorBalance={paymentSummary.priorBalance}
            totalPayout={paymentSummary.totalPayout}
          />
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quarterly Bookings Chart */}
        <BookingsChart data={bookingsData} />

        {/* Top Performers */}
        <TopPerformers performers={topPerformers} />
      </div>

      {/* Recent Bookings Table */}
      <RecentBookingsTable bookings={recentBookings} />
    </div>
  );
}
