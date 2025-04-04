
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { opsApi } from '@/api/ops';
import { Scheme } from '@/types/scheme';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { SchemeDetailsModal } from './SchemeDetailsModal';
import { ApproveSchemeModal } from './ApproveSchemeModal';
import { Input } from '@/components/ui/input';

export function SchemesApprovalTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  // Fetch schemes pending approval
  useEffect(() => {
    const fetchSchemes = async () => {
      if (!user?.clientId) return;
      
      try {
        setIsLoading(true);
        const data = await opsApi.getSchemesForApproval(user.clientId);
        setSchemes(data);
        setFilteredSchemes(data);
      } catch (error) {
        console.error('Error fetching schemes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load schemes pending approval.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchemes();
  }, [user, toast]);

  // Filter schemes based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSchemes(schemes);
      return;
    }

    const filtered = schemes.filter(
      scheme => 
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSchemes(filtered);
  }, [searchTerm, schemes]);

  // Handle approve scheme
  const handleApproveScheme = async (schemeId: string, notes?: string) => {
    if (!user?.clientId) return;
    
    try {
      const response = await opsApi.approveScheme(schemeId, user.clientId, notes);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Scheme has been approved successfully.',
        });
        
        // Update the local state
        setSchemes(prevSchemes => 
          prevSchemes.filter(scheme => scheme.schemeId !== schemeId)
        );
        setFilteredSchemes(prevFiltered => 
          prevFiltered.filter(scheme => scheme.schemeId !== schemeId)
        );
      } else {
        throw new Error('Failed to approve scheme');
      }
    } catch (error) {
      console.error('Error approving scheme:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve the scheme. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsApproveModalOpen(false);
    }
  };

  // Handle view scheme details
  const handleViewScheme = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setIsDetailsModalOpen(true);
  };

  // Handle open approve modal
  const handleOpenApproveModal = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setIsApproveModalOpen(true);
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'Simulated':
        return <Badge variant="outline">Simulated</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Schemes Pending Approval</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schemes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'No schemes found matching your search.' : 'No schemes pending approval.'}
        </div>
      ) : (
        <Table>
          <TableCaption>List of schemes pending approval.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Scheme Name</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Effective Period</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchemes.map((scheme) => (
              <TableRow key={scheme.schemeId || scheme.id}>
                <TableCell className="font-medium">{scheme.name}</TableCell>
                <TableCell>
                  {format(new Date(scheme.createdAt), 'PP')}
                </TableCell>
                <TableCell>{renderStatusBadge(scheme.status)}</TableCell>
                <TableCell>
                  {format(new Date(scheme.effectiveStart), 'PP')} - {format(new Date(scheme.effectiveEnd), 'PP')}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => handleViewScheme(scheme)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenApproveModal(scheme)}
                  >
                    Approve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedScheme && (
        <>
          <SchemeDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            scheme={selectedScheme}
          />
          <ApproveSchemeModal
            isOpen={isApproveModalOpen}
            onClose={() => setIsApproveModalOpen(false)}
            scheme={selectedScheme}
            onApprove={handleApproveScheme}
          />
        </>
      )}
    </div>
  );
}
