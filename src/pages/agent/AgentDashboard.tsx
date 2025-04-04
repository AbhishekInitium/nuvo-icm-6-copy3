
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AgentScheme, AgentResult, agentApi } from '@/api/agent';
import { AgentSchemeCard } from '@/components/agent/AgentSchemeCard';
import { AgentResultDetails } from '@/components/agent/AgentResultDetails';
import { AgentFilters } from '@/components/agent/AgentFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function AgentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<AgentScheme[]>([]);
  const [results, setResults] = useState<Record<string, AgentResult | null>>({});
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [schemeNameFilter, setSchemeNameFilter] = useState('');

  useEffect(() => {
    if (user?.clientId) {
      fetchAgentSchemes();
    }
  }, [user]);

  const fetchAgentSchemes = async () => {
    if (!user?.clientId) return;

    try {
      setLoading(true);
      // Use a mock agentId for now, in a real app this would come from the user object
      const mockAgentId = 'agent_001';
      const fetchedSchemes = await agentApi.getAgentSchemes(mockAgentId, user.clientId);
      setSchemes(fetchedSchemes);
    } catch (error) {
      console.error('Error fetching agent schemes:', error);
      toast({
        title: 'Failed to load schemes',
        description: 'There was an error loading your incentive schemes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSchemeClick = async (schemeId: string) => {
    if (!user?.clientId) return;
    
    // If already fetched, just toggle selection
    if (selectedScheme === schemeId) {
      setSelectedScheme(null);
      return;
    }
    
    setSelectedScheme(schemeId);
    
    // If we don't have the result for this scheme yet, fetch it
    if (!results[schemeId]) {
      try {
        const mockAgentId = 'agent_001';
        const result = await agentApi.getAgentResultForScheme(schemeId, mockAgentId, user.clientId);
        setResults(prev => ({
          ...prev,
          [schemeId]: result
        }));
      } catch (error) {
        console.error('Error fetching agent result:', error);
        toast({
          title: 'Failed to load scheme details',
          description: 'There was an error loading the incentive details. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Apply filters
  const filteredSchemes = schemes.filter(scheme => {
    // Filter by scheme name
    if (schemeNameFilter && !scheme.schemeName.toLowerCase().includes(schemeNameFilter.toLowerCase())) {
      return false;
    }
    
    // Filter by date range
    if (dateRange.start && new Date(scheme.executedAt) < dateRange.start) {
      return false;
    }
    if (dateRange.end && new Date(scheme.executedAt) > dateRange.end) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Incentives</h1>
        <p className="text-muted-foreground">
          View your incentive schemes and earnings
        </p>
      </div>

      {loading ? (
        <div className="py-10 text-center">
          <p>Loading your incentive schemes...</p>
        </div>
      ) : schemes.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No incentive schemes</AlertTitle>
          <AlertDescription>
            You don't have any incentive schemes assigned to you yet.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <AgentFilters 
            dateRange={dateRange}
            setDateRange={setDateRange}
            schemeNameFilter={schemeNameFilter}
            setSchemeNameFilter={setSchemeNameFilter}
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSchemes.map((scheme) => (
              <AgentSchemeCard
                key={scheme.schemeId}
                scheme={scheme}
                result={results[scheme.schemeId]}
                isSelected={selectedScheme === scheme.schemeId}
                onClick={() => handleSchemeClick(scheme.schemeId)}
              />
            ))}
          </div>

          {selectedScheme && results[selectedScheme] && (
            <AgentResultDetails result={results[selectedScheme]!} />
          )}
        </>
      )}
    </div>
  );
}
