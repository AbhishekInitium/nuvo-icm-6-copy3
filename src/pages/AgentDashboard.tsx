
import { Navigate } from 'react-router-dom';

// Redirect to the new AgentDashboard path
export default function AgentDashboard() {
  return <Navigate to="/agent-dashboard" replace />;
}
