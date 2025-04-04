
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { SchemeFormValues } from "@/hooks/useSchemeForm";

interface SchemeMetricsProps {
  control: Control<SchemeFormValues>;
}

export function SchemeMetrics({ control }: SchemeMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="quotaAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quota Amount</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0"
                placeholder="Enter quota amount" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="revenueBase"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Revenue Base</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select revenue base" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Orders">Orders</SelectItem>
                <SelectItem value="Invoices">Invoices</SelectItem>
                <SelectItem value="Collections">Collections</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
