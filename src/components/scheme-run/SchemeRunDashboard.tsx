
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SchemeList } from '@/components/scheme-run/SchemeList';
import { SimulationModal } from '@/components/scheme-run/SimulationModal';
import { LogsModal } from '@/components/scheme-run/LogsModal';
import { Scheme } from '@/types/scheme-run';
import { apiClient } from '@/api/client';
import { useSchemeExecution } from '@/hooks/useSchemeExecution';

export function SchemeRunDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulateModalOpen, setSimulateModalOpen] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  const {
    runningScheme,
    executionLogs,
    selectedLog,
    fetchExecutionLogs,
    getLogDetails,
    runSimulation,
    runProduction,
    downloadLogAsJson,
    copyLogToClipboard,
    setSelectedLog
  } = useSchemeExecution();

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
    await runProduction(scheme);
    fetchSchemes();
  };

  const handleViewLogs = async (scheme: Scheme) => {
    setSelectedScheme(scheme);
    await fetchExecutionLogs(scheme);
    setLogsModalOpen(true);
  };

  const handleSubmitSimulation = async () => {
    if (!selectedScheme) return;
    
    const result = await runSimulation(selectedScheme);
    if (result) {
      setSimulateModalOpen(false);
      fetchSchemes();
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
        onViewLogDetails={getLogDetails}
        onDownloadJson={downloadLogAsJson}
        onCopyLog={copyLogToClipboard}
      />
    </div>
  );
}
