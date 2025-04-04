
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExecutionLogList } from './ExecutionLogList';
import { LogDetailsView } from './LogDetailsView';
import { ExecutionLog, Scheme } from '@/types/scheme-run';

interface LogsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedScheme: Scheme | null;
  executionLogs: ExecutionLog[];
  selectedLog: ExecutionLog | null;
  onViewLogDetails: (log: ExecutionLog) => void;
}

export function LogsModal({
  open,
  onOpenChange,
  selectedScheme,
  executionLogs,
  selectedLog,
  onViewLogDetails
}: LogsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Execution Logs - {selectedScheme?.name}</DialogTitle>
          <DialogDescription>
            View all previous execution runs for this scheme.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="logs" className="w-full">
          <TabsList>
            <TabsTrigger value="logs">Execution Logs</TabsTrigger>
            {selectedLog && <TabsTrigger value="details">Log Details</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="logs">
            <div className="mt-4">
              <ExecutionLogList 
                executionLogs={executionLogs} 
                onViewDetails={onViewLogDetails} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            {selectedLog && <LogDetailsView selectedLog={selectedLog} />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
