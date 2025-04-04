
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { KpiConfigFormValues } from "@/hooks/useKpiConfiguratorForm";

interface ConfiguratorBasicInfoProps {
  control: Control<KpiConfigFormValues>;
}

export function ConfiguratorBasicInfo({ control }: ConfiguratorBasicInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="adminName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., NorthAmerica_Q1_Orders" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="calculationBase"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calculation Base</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select base type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Sales Orders">Sales Orders</SelectItem>
                  <SelectItem value="Invoices">Invoices</SelectItem>
                  <SelectItem value="Contracts">Contracts</SelectItem>
                  <SelectItem value="Opportunities">Opportunities</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="baseField"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Field</FormLabel>
              <FormControl>
                <Input placeholder="e.g., orderId" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
