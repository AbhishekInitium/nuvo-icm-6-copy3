
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { SchemeFormValues } from "@/hooks/useSchemeForm";
import { apiClient } from "@/api/client";

interface SchemeConfigProps {
  control: Control<SchemeFormValues>;
}

export function SchemeConfig({ control }: SchemeConfigProps) {
  // Fetch available configs for dropdown
  const { data: configsData, isLoading: configsLoading } = useQuery({
    queryKey: ['configs'],
    queryFn: async () => {
      const response = await apiClient.get('/integration/kpi-configs');
      return response.data.data;
    },
  });

  return (
    <FormField
      control={control}
      name="configName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Configuration</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            disabled={configsLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select configuration" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {configsLoading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Loading...</span>
                </div>
              ) : configsData && configsData.length > 0 ? (
                configsData.map((config: any) => (
                  <SelectItem key={config.adminName} value={config.adminName}>
                    {config.adminName}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-configs" disabled>
                  No configurations available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormDescription>
            Select the KPI configuration for this scheme
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
