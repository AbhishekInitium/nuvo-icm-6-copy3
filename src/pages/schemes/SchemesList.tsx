
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Incentive Schemes</h1>
        <Link to="/schemes/new">
          <Button>Create New Scheme</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading schemes...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No schemes found</p>
          <Link to="/schemes/new">
            <Button>Create your first scheme</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme) => (
            <Card 
              key={scheme.id} 
              className="h-full hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSchemeClick(scheme.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{scheme.name}</CardTitle>
                  <Badge variant={getStatusVariant(scheme.status)}>
                    {scheme.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  {scheme.description || 'No description'}
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span>{new Date(scheme.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span>{new Date(scheme.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function for badge variant
function getStatusVariant(status: string) {
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
