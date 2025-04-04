
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export function Settings() {
  const { user } = useAuth();
  const clientId = user?.clientId || '';
  
  // Mock client data lookup (would come from an API in production)
  const mockClients = {
    'ACME-001': 'ACME Corporation',
    'Globex-002': 'Globex Industries',
    'Initech-003': 'Initech Solutions',
    'Umbrella-004': 'Umbrella Enterprises',
    'Cyberdyne-005': 'Cyberdyne Systems'
  };
  
  const clientName = mockClients[clientId] || clientId;

  return (
    <div style={{
      maxWidth: '48rem',
      margin: '0 auto'
    }}>
      <h1 style={{
        fontSize: '1.875rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: '#1a202c'
      }}>
        Settings
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <Card style={{
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <CardHeader>
            <CardTitle style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              color: '#004c97'
            }}>
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div>
                <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Username:</span>
                {user?.username}
              </div>
              <div>
                <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Role:</span>
                <span style={{ 
                  backgroundColor: 'rgba(0, 76, 151, 0.1)',
                  color: '#004c97',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {user?.role}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card style={{
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <CardHeader>
            <CardTitle style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              color: '#004c97'
            }}>
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div>
                <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Client ID:</span>
                {clientId}
              </div>
              <div>
                <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Client Name:</span>
                {clientName}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card style={{
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <CardHeader>
          <CardTitle style={{
            fontSize: '1.125rem',
            fontWeight: 'bold',
            color: '#004c97'
          }}>
            Application Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p style={{ color: '#64748b' }}>
            Settings functionality will be available in a future update. 
            This section will include theme preferences, notification settings, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;
