
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';
import { Scheme } from '@/types/scheme';

export function SchemeDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch schemes data
  const { data: schemes, isLoading, error } = useQuery({
    queryKey: ['schemes'],
    queryFn: async (): Promise<Scheme[]> => {
      try {
        const response = await apiClient.get('/manager/schemes');
        return response.data.data;
      } catch (error) {
        console.error('Error fetching schemes:', error);
        throw error;
      }
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error fetching schemes',
        description: 'Unable to load schemes. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleCreateNew = () => {
    navigate('/schemes/new');
  };

  // Format dates for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Incentive Schemes</h1>
        <Button onClick={handleCreateNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Scheme
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Schemes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : schemes && schemes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Effective To</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schemes.map((scheme) => (
                  <TableRow 
                    key={scheme.id} 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => navigate(`/schemes/${scheme.id}`)}
                  >
                    <TableCell className="font-medium">{scheme.name}</TableCell>
                    <TableCell>{formatDate(scheme.startDate)}</TableCell>
                    <TableCell>{formatDate(scheme.endDate)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scheme.status)}`}>
                        {scheme.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No schemes found. Create your first scheme!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SchemeDashboard;
