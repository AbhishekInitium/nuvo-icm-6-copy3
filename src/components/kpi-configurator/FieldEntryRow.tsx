
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { FieldEntry, KpiConfigFormValues } from "@/hooks/useKpiConfiguratorForm";

interface FieldEntryRowProps {
  control: Control<KpiConfigFormValues>;
  section: "baseData" | "qualificationFields" | "adjustmentFields" | "exclusionFields";
  index: number;
  onRemove: () => void;
  showRemoveButton?: boolean;
}

export function FieldEntryRow({ control, section, index, onRemove, showRemoveButton = true }: FieldEntryRowProps) {
  return (
    <div className="grid grid-cols-12 gap-4 items-start">
      <div className="col-span-3">
        <FormField
          control={control}
          name={`${section}.${index}.kpiName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>KPI Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., TotalRevenue" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-3">
        <FormField
          control={control}
          name={`${section}.${index}.description`}
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

      <div className="col-span-2">
        <FormField
          control={control}
          name={`${section}.${index}.sourceType`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SAP">SAP</SelectItem>
                  <SelectItem value="External">External</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-2">
        <FormField
          control={control}
          name={`${section}.${index}.sourceField`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Field</FormLabel>
              <FormControl>
                <Input placeholder="e.g., VBRP-NETWR" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-1">
        <FormField
          control={control}
          name={`${section}.${index}.dataType`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Number">Number</SelectItem>
                  <SelectItem value="String">String</SelectItem>
                  <SelectItem value="Date">Date</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {showRemoveButton && (
        <div className="col-span-1 pt-8">
          <Button variant="ghost" size="icon" onClick={onRemove} type="button">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
