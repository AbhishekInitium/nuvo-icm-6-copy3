
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchemesApprovalTab } from '@/components/ops/SchemesApprovalTab';
import { RunHistoryTab } from '@/components/ops/RunHistoryTab';
import { AlertTriangle } from 'lucide-react';
import styles from '@/styles/opsDashboard.module.css';

export default function OpsDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("approval");
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    // Check if user has appropriate role
    if (user?.role === 'Finance' || user?.role === 'Manager') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [user]);

  if (!isAuthorized) {
    return (
      <div className={styles.alertCard}>
        <AlertTriangle size={20} />
        <div>
          <h4 className={styles.alertTitle}>Unauthorized Access</h4>
          <p>You don't have permission to access the Finance & Ops Portal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Finance & Ops Portal</h1>
        <p className={styles.subtitle}>Manage scheme approvals and review production runs</p>
      </div>

      <Tabs defaultValue="approval" value={activeTab} onValueChange={setActiveTab}>
        <div className={styles.tabList}>
          <TabsTrigger 
            value="approval" 
            className={`${styles.tab} ${activeTab === 'approval' ? styles.tabActive : ''}`}
          >
            Schemes Pending Approval
          </TabsTrigger>
          <TabsTrigger 
            value="runs" 
            className={`${styles.tab} ${activeTab === 'runs' ? styles.tabActive : ''}`}
          >
            Run History
          </TabsTrigger>
        </div>
        <TabsContent 
          value="approval" 
          className={activeTab === 'approval' ? styles.tabContentActive : styles.tabContent}
        >
          <SchemesApprovalTab />
        </TabsContent>
        <TabsContent 
          value="runs" 
          className={activeTab === 'runs' ? styles.tabContentActive : styles.tabContent}
        >
          <RunHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
