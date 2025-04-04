
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Scheme, ExecutionLog } from '@/types/scheme-run';
import { executionApi } from '@/api/execution';

export function useSchemeExecution() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [runningScheme, setRunningScheme] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);
  
  const fetchExecutionLogs = async (scheme: Scheme) => {
    if (!user?.clientId) {
      toast({
        title: 'Client ID Missing',
        description: 'No client ID available. Please log in again.',
        variant: 'destructive',
      });
      return [];
    }
    
    try {
      const logs = await executionApi.getExecutionLogs(scheme.schemeId, user.clientId);
      setExecutionLogs(logs);
      setSelectedLog(null); // Reset selected log when fetching new logs
      return logs;
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Failed to load execution logs',
        description: 'There was an error loading the execution logs. Please try again.',
        variant: 'destructive',
      });
      return [];
    }
  };
  
  const getLogDetails = async (log: ExecutionLog) => {
    if (!user?.clientId) return null;
    
    try {
      const details = await executionApi.getExecutionLogDetails(log.runId, user.clientId);
      if (details) {
        setSelectedLog(details);
      }
      return details;
    } catch (error) {
      console.error('Error fetching log details:', error);
      toast({
        title: 'Failed to load log details',
        description: 'There was an error loading the log details. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  const runSimulation = async (scheme: Scheme) => {
    if (!user?.clientId) return null;
    
    try {
      setRunningScheme(true);
      const response = await executionApi.runSimulation(scheme.schemeId, user.clientId);
      
      if (response.success) {
        toast({
          title: 'Simulation Complete',
          description: `Simulation ID: ${response.data.runId}`,
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to run simulation');
      }
    } catch (error) {
      console.error('Error running simulation:', error);
      toast({
        title: 'Failed to run simulation',
        description: 'There was an error running the simulation. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setRunningScheme(false);
    }
  };
  
  const runProduction = async (scheme: Scheme) => {
    if (!user?.clientId) return null;
    if (scheme.status !== 'Approved') {
      toast({
        title: 'Cannot Run',
        description: 'Only approved schemes can be run in production.',
        variant: 'destructive',
      });
      return null;
    }
    
    try {
      setRunningScheme(true);
      const response = await executionApi.runProduction(scheme.schemeId, user.clientId);
      
      if (response.success) {
        toast({
          title: 'Scheme Run Successfully',
          description: `Execution ID: ${response.data.runId}`,
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to run scheme');
      }
    } catch (error) {
      console.error('Error running scheme:', error);
      toast({
        title: 'Failed to run scheme',
        description: 'There was an error running the scheme in production. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setRunningScheme(false);
    }
  };
  
  const downloadLogAsJson = (log: ExecutionLog) => {
    try {
      const jsonString = JSON.stringify(log, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `execution-log-${log.runId}.json`;
      document.body.appendChild(a);
      a.click();
      
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
  
  const copyLogToClipboard = (log: ExecutionLog) => {
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
  
  return {
    runningScheme,
    executionLogs,
    selectedLog,
    fetchExecutionLogs,
    getLogDetails,
    runSimulation,
    runProduction,
    downloadLogAsJson,
    copyLogToClipboard,
    setSelectedLog,
  };
}
