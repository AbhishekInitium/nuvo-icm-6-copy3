
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { opsApi } from '@/api/ops';
import { ExecutionLog } from '@/types/scheme-run';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,

  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { RunDetailsModal } from './RunDetailsModal';

export function RunHistoryTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [runs, setRuns] = useState<ExecutionLog[]>([]);
  const [filteredRuns, setFilteredRuns] = useState<ExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRun, setSelectedRun] = useState<ExecutionLog | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch execution logs
  useEffect(() => {
    const fetchRuns = async () => {
      if (!user?.clientId) return;
      
      try {
        setIsLoading(true);
        const data = await opsApi.getProductionRuns(user.clientId);
        setRuns(data);
        setFilteredRuns(data);
      } catch (error) {
        console.error('Error fetching production runs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load production run history.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRuns();
  }, [user, toast]);

  // Filter runs based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRuns(runs);
      return;
    }

    const filtered = runs.filter(
      run => 
        run.runId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.schemeId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRuns(filtered);
  }, [searchTerm, runs]);

  // Handle export run data
  const handleExportJSON = async (runId: string) => {
    if (!user?.clientId) return;
    
    try {
      await opsApi.exportRunData(runId, user.clientId);
      toast({
        title: 'Success',
        description: 'Run data exported as JSON successfully.',
      });
    } catch (error) {
      console.error('Error exporting run data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export run data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle export run data as CSV
  const handleExportCSV = async (runId: string) => {
    if (!user?.clientId) return;
    
    try {
      await opsApi.exportRunDataAsCsv(runId, user.clientId);
      toast({
        title: 'Success',
        description: 'Run data exported as CSV successfully.',
      });
    } catch (error) {
      console.error('Error exporting run data as CSV:', error);
      toast({
        title: 'Error',
        description: 'Failed to export run data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle view run details
  const handleViewRun = async (run: ExecutionLog) => {
    setSelectedRun(run);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Production Run History</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search runs..."
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
      ) : filteredRuns.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'No runs found matching your search.' : 'No production runs available.'}
        </div>
      ) : (
        <Table>
          <TableCaption>History of production runs.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Run ID</TableHead>
              <TableHead>Scheme ID</TableHead>
              <TableHead>Execution Date</TableHead>
              <TableHead>Agents</TableHead>
              <TableHead>Total Commission</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRuns.map((run) => (
              <TableRow key={run.runId}>
                <TableCell className="font-medium">{run.runId}</TableCell>
                <TableCell>{run.schemeId}</TableCell>
                <TableCell>
                  {format(new Date(run.executedAt), 'PPP')}
                </TableCell>
                <TableCell>
                  {run.summary.totalAgents} 
                  <span className="text-muted-foreground ml-1">
                    ({run.summary.passed} qualified)
                  </span>
                </TableCell>
                <TableCell>
                  ${run.summary.totalCommission.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => handleViewRun(run)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleExportJSON(run.runId)}>
                        Export as JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportCSV(run.runId)}>
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedRun && (
        <RunDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          run={selectedRun}
        />
      )}
    </div>
  );
}
