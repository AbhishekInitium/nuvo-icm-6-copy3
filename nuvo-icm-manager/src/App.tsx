
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { SchemesList } from '@/pages/schemes/SchemesList';
import { SchemeDetail } from '@/pages/schemes/SchemeDetail';
import { CreateScheme } from '@/pages/schemes/CreateScheme';
import SchemeDashboard from '@/pages/SchemeDashboard';
import SchemeForm from '@/pages/SchemeForm';
import { Toaster } from '@/components/ui/toaster';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/schemes" replace />} />
            <Route path="/schemes" element={<SchemeDashboard />} />
            <Route path="/schemes/new" element={<SchemeForm />} />
            <Route path="/schemes/:id" element={<SchemeDetail />} />
            <Route path="*" element={<Navigate to="/schemes" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
