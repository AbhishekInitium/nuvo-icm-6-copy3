
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import styles from '@/styles/schemesList.module.css';

// Define the Scheme type since we're missing the import
type Scheme = {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
};

export function SchemesList() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockSchemes: Scheme[] = [
          {
            id: '1',
            name: 'Q1 Sales Incentive',
            description: 'First quarter sales incentive program',
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            status: 'ACTIVE',
            clientId: 'client_XYZ',
            createdAt: '2024-12-15',
            updatedAt: '2024-12-15'
          },
          {
            id: '2',
            name: 'Annual Retention Bonus',
            description: 'Yearly customer retention incentive',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            status: 'DRAFT',
            clientId: 'client_XYZ',
            createdAt: '2024-12-20',
            updatedAt: '2024-12-20'
          }
        ];
        
        setSchemes(mockSchemes);
        setError(null);
      } catch (err) {
        console.error('Error fetching schemes:', err);
        setError('Failed to load schemes. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load schemes.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [toast]);

  const handleSchemeClick = (id: string) => {
    navigate(`/schemes/${id}`);
  };

  // Helper function for badge variant
  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'DRAFT':
      case 'Draft': return 'secondary';
      case 'APPROVED':
      case 'Approved': return 'success';
      case 'ACTIVE': return 'default';
      case 'COMPLETED': return 'outline';
      default: return 'outline';
    }
  }

  return (
    <div className={styles.schemesContainer}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Incentive Schemes</h1>
        <Button onClick={() => navigate('/schemes/new')}>Create New Scheme</Button>
      </div>

      {loading ? (
        <div className={styles.loader}>Loading schemes...</div>
      ) : error ? (
        <div className={styles.noSchemes}>{error}</div>
      ) : schemes.length === 0 ? (
        <div className={styles.noSchemes}>
          <p>No schemes found</p>
          <Button onClick={() => navigate('/schemes/new')}>Create your first scheme</Button>
        </div>
      ) : (
        <div className={styles.schemeGrid}>
          {schemes.map((scheme) => (
            <div 
              key={scheme.id} 
              className={styles.schemeCard}
              onClick={() => handleSchemeClick(scheme.id)}
            >
              <div className={styles.schemeHeader}>
                <h3 className={styles.schemeTitle}>{scheme.name}</h3>
                <Badge variant={getStatusBadgeClass(scheme.status)}>
                  {scheme.status}
                </Badge>
              </div>
              <div className={styles.schemeDescription}>
                {scheme.description || 'No description'}
              </div>
              <div className={styles.schemeMeta}>
                <div className={styles.schemeMetaItem}>
                  <span className={styles.schemeMetaLabel}>Start:</span>
                  <span className={styles.schemeMetaValue}>
                    {new Date(scheme.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.schemeMetaItem}>
                  <span className={styles.schemeMetaLabel}>End:</span>
                  <span className={styles.schemeMetaValue}>
                    {new Date(scheme.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
