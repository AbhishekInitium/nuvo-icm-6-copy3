
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AgentScheme, AgentResult, agentApi } from '@/api/agent';
import { AgentFilters } from '@/components/agent/AgentFilters';
import { Info, TrendingUp, Award, Calendar } from 'lucide-react';
import styles from '@/styles/modernUI.module.css';

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

  // Function to determine which icon to show based on scheme type
  const getSchemeIcon = (scheme: AgentScheme) => {
    switch (scheme.type) {
      case 'sales':
        return <TrendingUp size={20} className={styles.infoIcon} />;
      case 'performance':
        return <Award size={20} className={styles.infoIcon} />;
      default:
        return <Calendar size={20} className={styles.infoIcon} />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>My Incentives</h1>
        <p className={styles.subtitle}>View your incentive schemes and earnings</p>
      </div>

      {loading ? (
        <div className={styles.loader}>
          <p>Loading your incentive schemes...</p>
        </div>
      ) : schemes.length === 0 ? (
        <div className={styles.alertBox}>
          <div>
            <Info size={20} className={styles.infoIcon} />
          </div>
          <div className={styles.alertContent}>
            <h4 className={styles.alertTitle}>No incentive schemes</h4>
            <p>You don't have any incentive schemes assigned to you yet.</p>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.filterSection}>
            <AgentFilters 
              dateRange={dateRange}
              setDateRange={setDateRange}
              schemeNameFilter={schemeNameFilter}
              setSchemeNameFilter={setSchemeNameFilter}
            />
          </div>

          <div className={styles.cardGrid}>
            {filteredSchemes.map((scheme, index) => (
              <div
                key={scheme.schemeId}
                className={`${styles.card} ${selectedScheme === scheme.schemeId ? styles.selectedCard : ''} ${styles.animate}`}
                onClick={() => handleSchemeClick(scheme.schemeId)}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{scheme.schemeName}</h3>
                  <span className={`${styles.badge} ${scheme.mode === 'production' ? styles.badgePrimary : styles.badgeSecondary}`}>
                    {scheme.mode === 'production' ? 'Production' : 'Simulation'}
                  </span>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.cardDetail}>
                    <span className={styles.detailLabel}>Period:</span>
                    <span className={styles.detailValue}>
                      {scheme.effectiveStart ? new Date(scheme.effectiveStart).toLocaleDateString() : 'N/A'} - {scheme.effectiveEnd ? new Date(scheme.effectiveEnd).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className={styles.cardDetail}>
                    <span className={styles.detailLabel}>Executed:</span>
                    <span className={styles.detailValue}>{new Date(scheme.executedAt).toLocaleDateString()}</span>
                  </div>
                  {results[scheme.schemeId] && (
                    <div className={styles.earningSummary}>
                      <div className={styles.detailLabel}>Total Earnings</div>
                      <div className={styles.earningAmount}>
                        ${results[scheme.schemeId]?.commission.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedScheme && results[selectedScheme] && (
            <div className={styles.detailPanel}>
              <div className={styles.detailHeader}>
                <h3 className={styles.detailTitle}>Incentive Details</h3>
              </div>
              <div className={styles.detailContent}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Qualification Status</th>
                      <th>Commission</th>
                      <th>Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{results[selectedScheme]?.qualified ? 'Qualified' : 'Not Qualified'}</td>
                      <td>${results[selectedScheme]?.commission.toFixed(2)}</td>
                      <td>{results[selectedScheme]?.totalSales ? `$${results[selectedScheme]?.totalSales.toFixed(2)}` : 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
