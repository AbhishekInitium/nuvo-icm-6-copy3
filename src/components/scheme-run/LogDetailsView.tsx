
import { Button } from '@/components/ui/button';
import { ExecutionLog } from '@/types/scheme-run';
import { FileDown, Copy } from 'lucide-react';
import { RunSummary } from './log-details/RunSummary';
import { AgentResultsList } from './log-details/AgentResultsList';

interface LogDetailsViewProps {
  selectedLog: ExecutionLog;
  onDownloadJson: (log: ExecutionLog) => void;
  onCopyLog: (log: ExecutionLog) => void;
}

export function LogDetailsView({ 
  selectedLog,
  onDownloadJson,
  onCopyLog
}: LogDetailsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg">Run Details: {selectedLog.runId}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownloadJson(selectedLog)}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopyLog(selectedLog)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Log
          </Button>
        </div>
      </div>

      <RunSummary selectedLog={selectedLog} />
      <AgentResultsList selectedLog={selectedLog} />
    </div>
  );
}
