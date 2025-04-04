
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/api/client";

interface KpiConfig {
  _id: string;
  adminName: string;
  calculationBase: string;
  clientId: string;
  createdAt: string;
}

export function KpiConfigurations() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch KPI configurations
  const { data: configs, isLoading: isLoadingConfigs } = useQuery({
    queryKey: ['kpi-configurations'],
    queryFn: async () => {
      const response = await apiClient.get("/admin/configs", {
        params: { clientId: "client_XYZ" } // This would normally come from context
      });
      return response.data.data || [];
    },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">KPI Configurations</h1>
          <p className="text-muted-foreground">
            Manage your KPI configurations for incentive schemes
          </p>
        </div>
        <Button onClick={() => navigate("/kpi-configurator")}>
          <Plus className="mr-2 h-4 w-4" />
          New Configuration
        </Button>
      </div>

      {isLoadingConfigs ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : configs && configs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs.map((config: KpiConfig) => (
            <Card key={config._id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/kpi-configurator/${config._id}`)}>
              <CardHeader>
                <CardTitle>{config.adminName}</CardTitle>
                <CardDescription>Base: {config.calculationBase}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(config.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No configurations found</CardTitle>
            <CardDescription>
              Create your first KPI configuration to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/kpi-configurator")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Configuration
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default KpiConfigurations;
