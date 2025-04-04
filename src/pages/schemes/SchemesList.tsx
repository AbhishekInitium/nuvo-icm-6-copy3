
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

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

  const getStatusBadgeClass = (status: Scheme['status']) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <Link key={scheme.id} to={`/schemes/${scheme.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{scheme.name}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(scheme.status)}`}>
                      {scheme.status}
                    </span>
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
