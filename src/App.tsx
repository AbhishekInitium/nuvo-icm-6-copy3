
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { SchemeDetail } from "./pages/schemes/SchemeDetail";
import { SchemesList } from "./pages/schemes/SchemesList";
import SchemeDashboard from "./pages/SchemeDashboard";
import SchemeForm from "./pages/SchemeForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/schemes" replace />} />
          <Route path="/" element={<MainLayout />}>
            <Route path="/schemes" element={<SchemeDashboard />} />
            <Route path="/schemes/new" element={<SchemeForm />} />
            <Route path="/schemes/:id" element={<SchemeDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
