
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Eye, CheckCircle } from 'lucide-react';
import styles from '@/styles/opsDashboard.module.css';

interface SchemeForApproval {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  status: string;
}

export function SchemesApprovalTab() {
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<SchemeForApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockSchemes = [
          { 
            id: '1', 
            name: 'Q1 2025 Sales Incentive', 
            createdAt: '2024-12-15T10:30:00Z',
            createdBy: 'john.doe@example.com',
            status: 'Draft'
          },
          { 
            id: '2', 
            name: 'Customer Retention Bonus', 
            createdAt: '2024-12-18T14:45:00Z',
            createdBy: 'jane.smith@example.com',
            status: 'Simulated'
          }
        ];
        
        setSchemes(mockSchemes);
      } catch (error) {
        console.error('Error fetching schemes for approval:', error);
        toast({
          title: "Error",
          description: "Failed to load schemes pending approval",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchemes();
  }, [toast]);
  
  const handleViewScheme = (id: string) => {
    // In a real app, this would likely open a modal or navigate to a details page
    console.log(`View scheme details for ID: ${id}`);
  };
  
  const handleApproveScheme = async (id: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setSchemes(prevSchemes => 
        prevSchemes.filter(scheme => scheme.id !== id)
      );
      
      toast({
        title: "Scheme Approved",
        description: "The scheme has been approved successfully",
      });
    } catch (error) {
      console.error('Error approving scheme:', error);
      toast({
        title: "Error",
        description: "Failed to approve scheme",
        variant: "destructive",
      });
    }
  };
  
  // Filter schemes based on search term
  const filteredSchemes = schemes.filter(scheme => 
    scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scheme.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return <div>Loading schemes for approval...</div>;
  }
  
  return (
    <div>
      {schemes.length > 0 ? (
        <>
          <div className={styles.filterSection}>
            <input
              type="text"
              placeholder="Search by scheme name or creator"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          
          <table className={styles.approvalTable}>
            <thead>
              <tr>
                <th>Scheme Name</th>
                <th>Created Date</th>
                <th>Creator</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchemes.map((scheme) => (
                <tr key={scheme.id}>
                  <td>{scheme.name}</td>
                  <td>{new Date(scheme.createdAt).toLocaleDateString()}</td>
                  <td>{scheme.createdBy}</td>
                  <td>{scheme.status}</td>
                  <td className={styles.actionsCell}>
                    <button 
                      className={styles.viewButton}
                      onClick={() => handleViewScheme(scheme.id)}
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button 
                      className={styles.approveButton}
                      onClick={() => handleApproveScheme(scheme.id)}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div className={styles.noData}>
          <p>No schemes pending approval at this time.</p>
        </div>
      )}
    </div>
  );
}
