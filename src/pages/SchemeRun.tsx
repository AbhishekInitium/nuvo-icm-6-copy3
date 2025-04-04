
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SchemeList } from '@/components/scheme-run/SchemeList';
import { SimulationModal } from '@/components/scheme-run/SimulationModal';
import { LogsModal } from '@/components/scheme-run/LogsModal';
import { Scheme, ExecutionLog } from '@/types/scheme-run';
import { apiClient } from '@/api/client';

export default function SchemeRun() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulateModalOpen, setSimulateModalOpen] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [runningScheme, setRunningScheme] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const clientId = user?.clientId;
      if (!clientId) {
        toast({
          title: 'Authentication Error',
          description: 'Client ID not available. Please log in again.',
          variant: 'destructive',
        });
        return;
      }

      const response = await apiClient.get(`/manager/schemes?clientId=${clientId}`);
      setSchemes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      toast({
        title: 'Failed to load schemes',
        description: 'There was an error loading the schemes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setSimulateModalOpen(true);
  };

  const handleRunProduction = async (scheme: Scheme) => {
    if (scheme.status !== 'Approved') {
      toast({
        title: 'Cannot Run',
        description: 'Only approved schemes can be run in production.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setRunningScheme(true);
      const response = await apiClient.post('/execute/run', {
        schemeId: scheme.schemeId,
        mode: 'production',
        clientId: user?.clientId,
      });

      if (response.data.success) {
        toast({
          title: 'Scheme Run Successfully',
          description: `Execution ID: ${response.data.data.runId}`,
        });
        fetchSchemes();
      } else {
        throw new Error(response.data.error || 'Failed to run scheme');
      }
    } catch (error) {
      console.error('Error running scheme:', error);
      toast({
        title: 'Failed to run scheme',
        description: 'There was an error running the scheme in production. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRunningScheme(false);
    }
  };

  const handleViewLogs = async (scheme: Scheme) => {
    try {
      setSelectedScheme(scheme);
      const response = await apiClient.get(`/execute/logs?clientId=${user?.clientId}&schemeId=${scheme.schemeId}`);
      
      if (response.data.success) {
        setExecutionLogs(response.data.data || []);
        setLogsModalOpen(true);
        setSelectedLog(null); // Reset selected log when viewing new logs
      } else {
        throw new Error(response.data.error || 'Failed to fetch execution logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Failed to load execution logs',
        description: 'There was an error loading the execution logs. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewLogDetails = async (log: ExecutionLog) => {
    try {
      const response = await apiClient.get(`/execute/log/${log.runId}?clientId=${user?.clientId}`);
      
      if (response.data.success) {
        setSelectedLog(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch execution log details');
      }
    } catch (error) {
      console.error('Error fetching log details:', error);
      toast({
        title: 'Failed to load log details',
        description: 'There was an error loading the log details. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadJson = (log: ExecutionLog) => {
    try {
      // Create a blob with the JSON data
      const jsonString = JSON.stringify(log, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `execution-log-${log.runId}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Download Started',
        description: 'The execution log is being downloaded as a JSON file.',
      });
    } catch (error) {
      console.error('Error downloading JSON:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download the execution log. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLog = (log: ExecutionLog) => {
    try {
      const jsonString = JSON.stringify(log, null, 2);
      navigator.clipboard.writeText(jsonString);
      
      toast({
        title: 'Copied to Clipboard',
        description: 'The execution log has been copied to your clipboard.',
      });
    } catch (error) {
      console.error('Error copying log:', error);
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy the execution log. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitSimulation = async () => {
    if (!selectedScheme || !uploadFile) {
      toast({
        title: 'Missing Information',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setRunningScheme(true);
      
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('schemeId', selectedScheme.schemeId);
      formData.append('clientId', user?.clientId || '');

      const response = await apiClient.post('/execute/run', {
        schemeId: selectedScheme.schemeId,
        mode: 'simulation',
        clientId: user?.clientId,
      });

      if (response.data.success) {
        toast({
          title: 'Simulation Complete',
          description: `Simulation ID: ${response.data.data.runId}`,
        });
        setSimulateModalOpen(false);
        fetchSchemes();
      } else {
        throw new Error(response.data.error || 'Failed to run simulation');
      }
    } catch (error) {
      console.error('Error running simulation:', error);
      toast({
        title: 'Failed to run simulation',
        description: 'There was an error running the simulation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRunningScheme(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Incentive Scheme Execution</h1>
      </div>

      <SchemeList
        schemes={schemes}
        loading={loading}
        onSimulate={handleSimulate}
        onRunProduction={handleRunProduction}
        onViewLogs={handleViewLogs}
        runningScheme={runningScheme}
      />

      <SimulationModal
        open={simulateModalOpen}
        onOpenChange={setSimulateModalOpen}
        selectedScheme={selectedScheme}
        uploadFile={uploadFile}
        setUploadFile={setUploadFile}
        onSubmit={handleSubmitSimulation}
        isRunning={runningScheme}
      />

      <LogsModal
        open={logsModalOpen}
        onOpenChange={setLogsModalOpen}
        selectedScheme={selectedScheme}
        executionLogs={executionLogs}
        selectedLog={selectedLog}
        onViewLogDetails={handleViewLogDetails}
        onDownloadJson={handleDownloadJson}
        onCopyLog={handleCopyLog}
      />
    </div>
  );
}
