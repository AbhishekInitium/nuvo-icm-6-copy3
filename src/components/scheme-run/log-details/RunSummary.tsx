
import { ExecutionLog } from '@/types/scheme-run';

interface RunSummaryProps {
  selectedLog: ExecutionLog;
}

export function RunSummary({ selectedLog }: RunSummaryProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium text-lg mb-2">Run Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-500">Run Type</p>
          <p className="font-medium">
            {selectedLog.mode === 'simulation' ? 'Simulation' : 'Production'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Agents</p>
          <p className="font-medium">{selectedLog.summary.totalAgents}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Qualified</p>
          <p className="font-medium text-green-600">{selectedLog.summary.passed}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Not Qualified</p>
          <p className="font-medium text-red-600">{selectedLog.summary.failed}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Commission</p>
          <p className="font-medium">${selectedLog.summary.totalCommission.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
