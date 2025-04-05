
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { SchemeDetails } from "./pages/schemes/SchemeDetails";
import { SchemesList } from "./pages/schemes/SchemesList";
import SchemeDashboard from "./pages/SchemeDashboard";
import SchemeForm from "./pages/SchemeForm";
import SchemeRun from "./pages/SchemeRun";
import KpiConfigurator from "./pages/KpiConfigurator";
import KpiConfigurations from "./pages/KpiConfigurations";
import AgentDashboard from "./pages/agent/AgentDashboard";
import OpsDashboard from "./pages/OpsDashboard";
import Settings from "./pages/Settings";
import SystemConfig from "./pages/SystemConfig";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { MongoProvider } from "./contexts/MongoContext";
import { MongoGuard } from "./components/mongo/MongoGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Component for home route redirection based on role
const HomeRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === "Admin") return <Navigate to="/kpi-configurator" replace />;
  if (user?.role === "Agent") return <Navigate to="/agent-dashboard" replace />;
  if (user?.role === "Finance") return <Navigate to="/finance-ops" replace />;
  return <Navigate to="/schemes" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MongoProvider>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              {/* Public route for login */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes within MainLayout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MongoGuard>
                      <MainLayout />
                    </MongoGuard>
                  </ProtectedRoute>
                }
              >
                {/* Redirect based on role */}
                <Route index element={<HomeRedirect />} />
                
                {/* Manager Routes */}
                <Route
                  path="/schemes"
                  element={
                    <ProtectedRoute allowedRoles={["Manager"]}>
                      <SchemeDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/schemes/new"
                  element={
                    <ProtectedRoute allowedRoles={["Manager"]}>
                      <SchemeForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/schemes/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={["Manager"]}>
                      <SchemeForm isEditing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/schemes/:id"
                  element={
                    <ProtectedRoute allowedRoles={["Manager"]}>
                      <SchemeDetails />
                    </ProtectedRoute>
                  }
                />
                
                {/* Scheme Run Route - available to Managers and Finance roles */}
                <Route
                  path="/scheme-run"
                  element={
                    <ProtectedRoute allowedRoles={["Manager", "Finance"]}>
                      <SchemeRun />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Routes */}
                <Route
                  path="/kpi-configurator"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <KpiConfigurator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kpi-configurations"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <KpiConfigurations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/system-config"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <SystemConfig />
                    </ProtectedRoute>
                  }
                />
                
                {/* Agent Routes */}
                <Route
                  path="/agent-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["Agent"]}>
                      <AgentDashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Finance & Ops Routes */}
                <Route
                  path="/finance-ops"
                  element={
                    <ProtectedRoute allowedRoles={["Finance", "Manager"]}>
                      <OpsDashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Settings - accessible to all roles */}
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                
                {/* Placeholder for Simulations route */}
                <Route
                  path="/simulations"
                  element={
                    <ProtectedRoute allowedRoles={["Manager"]}>
                      <div className="p-8 text-center">
                        <h1 className="text-2xl font-bold mb-4">Simulations</h1>
                        <p className="text-muted-foreground">
                          Simulation functionality will be added in a future update.
                        </p>
                      </div>
                    </ProtectedRoute>
                  }
                />
              </Route>
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </MongoProvider>
  </QueryClientProvider>
);

export default App;
