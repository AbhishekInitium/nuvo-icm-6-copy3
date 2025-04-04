import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  PlusCircle, 
  Download, 
  Copy, 
  Upload, 
  ArrowUpRight, 
  Eye, 
  Edit, 
  FileJson 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { schemeApi } from '@/api/schemes';
import { Scheme } from '@/types/scheme';
import { ImportSchemeModal } from '@/components/scheme/ImportSchemeModal';

export function SchemeDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [importModalOpen, setImportModalOpen] = useState(false);
  
  const { 
    data: schemes, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['schemes'],
    queryFn: () => schemeApi.getSchemes(),
  });

  const copyMutation = useMutation({
    mutationFn: (id: string) => schemeApi.copyScheme(id),
    onSuccess: (data) => {
      toast({
        title: 'Scheme copied successfully',
        description: `Created new draft: ${data.name}`,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error copying scheme',
        description: error instanceof Error ? error.message : 'Failed to copy scheme',
        variant: 'destructive',
      });
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

  const handleCopyScheme = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    copyMutation.mutate(id);
  };

  const handleDownloadScheme = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const safeFileName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    schemeApi.downloadScheme(id, `scheme_${safeFileName}.json`);
  };

  const handleViewScheme = (id: string) => {
    navigate(`/schemes/${id}`);
  };

  const handleEditScheme = (id: string, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (status.toUpperCase() !== 'DRAFT') {
      toast({
        title: 'Cannot edit scheme',
        description: 'Only draft schemes can be edited.',
        variant: 'destructive',
      });
      return;
    }
    
    navigate(`/schemes/edit/${id}`);
  };

  const getSchemeOrigin = (scheme: Scheme) => {
    if (scheme.versionOf) {
      return 'Copied';
    }
    return 'Original';
  };

  const formatDate = (dateValue: string | Date) => {
    if (!dateValue) return 'Not set';
    
    try {
      if (dateValue instanceof Date) {
        return format(dateValue, 'MMM dd, yyyy');
      }
      return format(new Date(dateValue), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid Date';
    }
  };

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
        <div className="flex space-x-2">
          <Button onClick={() => setImportModalOpen(true)} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Scheme
          </Button>
          <Button onClick={handleCreateNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Scheme
          </Button>
        </div>
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
                  <TableHead>Origin</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schemes.map((scheme) => (
                  <TableRow 
                    key={scheme.id} 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleViewScheme(scheme.id)}
                  >
                    <TableCell className="font-medium">
                      {scheme.name}
                      {scheme.versionOf && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Copied from: 
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 ml-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/schemes/${scheme.versionOf}`);
                            }}
                          >
                            {scheme.versionOf}
                            <ArrowUpRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(scheme.effectiveStart || scheme.startDate)}</TableCell>
                    <TableCell>{formatDate(scheme.effectiveEnd || scheme.endDate)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scheme.status)}`}>
                        {scheme.status}
                      </span>
                    </TableCell>
                    <TableCell>{getSchemeOrigin(scheme)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewScheme(scheme.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleEditScheme(scheme.id, scheme.status, e)}
                            disabled={scheme.status.toUpperCase() !== 'DRAFT'}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleCopyScheme(scheme.id, e)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDownloadScheme(scheme.id, scheme.name, e)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      <ImportSchemeModal 
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
      />
    </div>
  );
}

export default SchemeDashboard;
