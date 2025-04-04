
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { schemeApi } from '@/api/schemes';
import { Scheme } from '@/types/scheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SchemeDetail() {
  const { id } = useParams<{ id: string }>();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheme = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await schemeApi.getScheme(id);
        setScheme(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching scheme:', err);
        setError('Failed to load scheme details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8">Loading scheme details...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Link to="/schemes">
          <Button>Back to Schemes List</Button>
        </Link>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">Scheme not found</div>
        <Link to="/schemes">
          <Button>Back to Schemes List</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">{scheme.name}</h1>
        <div className="space-x-2">
          <Button variant="outline">Edit Scheme</Button>
          <Button variant="outline">Run Simulation</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scheme Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="font-medium">Description</div>
                <div className="text-muted-foreground">
                  {scheme.description || 'No description'}
                </div>
              </div>
              <div>
                <div className="font-medium">Status</div>
                <div className="text-muted-foreground">{scheme.status}</div>
              </div>
              <div>
                <div className="font-medium">Date Range</div>
                <div className="text-muted-foreground">
                  {new Date(scheme.startDate).toLocaleDateString()} to {new Date(scheme.endDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="font-medium">Created</div>
                <div className="text-muted-foreground">
                  {new Date(scheme.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="font-medium">Last Updated</div>
                <div className="text-muted-foreground">
                  {new Date(scheme.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KPI Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              KPI details will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
