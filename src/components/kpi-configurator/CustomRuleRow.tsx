
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { KpiConfigFormValues } from "@/hooks/useKpiConfiguratorForm";

interface CustomRuleRowProps {
  control: Control<KpiConfigFormValues>;
  index: number;
  onRemove: () => void;
}

export function CustomRuleRow({ control, index, onRemove }: CustomRuleRowProps) {
  return (
    <div className="grid grid-cols-12 gap-4 items-start bg-muted/20 p-4 rounded-md">
      <div className="col-span-3">
        <FormField
          control={control}
          name={`customRules.${index}.kpiName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rule Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., HighValueDiscount" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-3">
        <FormField
          control={control}
          name={`customRules.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Optional description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-5">
        <FormField
          control={control}
          name={`customRules.${index}.criteria`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Criteria</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="e.g., (orderValue > 10000) && (customerSegment === 'Enterprise')" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-1 pt-8">
        <Button variant="ghost" size="icon" onClick={onRemove} type="button">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
