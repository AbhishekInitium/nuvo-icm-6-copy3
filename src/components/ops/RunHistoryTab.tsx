
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';
import styles from '@/styles/opsDashboard.module.css';

interface ExecutionLog {
  id: string;
  schemeName: string;
  runType: 'Simulation' | 'Production';
  runDate: string;
  agentCount: number;
  status: 'Completed' | 'Failed' | 'In Progress';
}

export function RunHistoryTab() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchExecutionLogs = async () => {
      try {
        setLoading(true);
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockLogs = [
          {
            id: 'exec-001',
            schemeName: 'Q1 2025 Sales Incentive',
            runType: 'Production' as const,
            runDate: '2025-01-05T09:15:00Z',
            agentCount: 125,
            status: 'Completed' as const
          },
          {
            id: 'exec-002',
            schemeName: 'Q1 2025 Sales Incentive',
            runType: 'Simulation' as const,
            runDate: '2024-12-20T14:30:00Z',
            agentCount: 125,
            status: 'Completed' as const
          },
          {
            id: 'exec-003',
            schemeName: 'Customer Retention Bonus',
            runType: 'Simulation' as const,
            runDate: '2024-12-22T11:45:00Z',
            agentCount: 87,
            status: 'Completed' as const
          }
        ];
        
        setLogs(mockLogs);
      } catch (error) {
        console.error('Error fetching execution logs:', error);
        toast({
          title: "Error",
          description: "Failed to load execution history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchExecutionLogs();
  }, [toast]);
  
  const handleExportData = async (logId: string, format: 'csv' | 'json') => {
    try {
      // In a real app, this would trigger an API call to download the file
      console.log(`Exporting ${format.toUpperCase()} data for log ID: ${logId}`);
      
      // Simulate successful download
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Export Started",
        description: `Your ${format.toUpperCase()} file is being prepared for download`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate export file",
        variant: "destructive",
      });
    }
  };
  
  // Filter logs based on search term
  const filteredLogs = logs.filter(log => 
    log.schemeName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  function getStatusClassName(status: string) {
    switch (status) {
      case 'Completed': return 'success';
      case 'Failed': return 'destructive';
      case 'In Progress': return 'warning';
      default: return '';
    }
  }

  if (loading) {
    return <div>Loading execution history...</div>;
  }
  
  return (
    <div>
      {logs.length > 0 ? (
        <>
          <div className={styles.filterSection}>
            <input
              type="text"
              placeholder="Search by scheme name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          
          <button 
            className={styles.exportButton}
            onClick={() => handleExportData('all', 'csv')}
          >
            <Download size={16} />
            Export All Results (CSV)
          </button>
          
          <table className={styles.approvalTable}>
            <thead>
              <tr>
                <th>Scheme Name</th>
                <th>Run Type</th>
                <th>Run Date</th>
                <th>Agent Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.schemeName}</td>
                  <td>{log.runType}</td>
                  <td>{new Date(log.runDate).toLocaleString()}</td>
                  <td>{log.agentCount}</td>
                  <td>
                    <span className={getStatusClassName(log.status)}>
                      {log.status}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleExportData(log.id, 'csv')}
                    >
                      <Download size={16} />
                      CSV
                    </button>
                    <button
                      className={styles.viewButton}
                      onClick={() => handleExportData(log.id, 'json')}
                    >
                      <Download size={16} />
                      JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div className={styles.noData}>
          <p>No execution logs available.</p>
        </div>
      )}
    </div>
  );
}
