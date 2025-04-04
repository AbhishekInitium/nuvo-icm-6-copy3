
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Control, useFieldArray } from "react-hook-form";
import { CustomRuleRow } from "./CustomRuleRow";
import { KpiConfigFormValues } from "@/hooks/useKpiConfiguratorForm";

interface CustomRulesSectionProps {
  control: Control<KpiConfigFormValues>;
  onAddRule: () => void;
  onRemoveRule: (index: number) => void;
}

export function CustomRulesSection({
  control,
  onAddRule,
  onRemoveRule,
}: CustomRulesSectionProps) {
  // Use field array to manage the dynamic rules
  const { fields } = useFieldArray({
    control,
    name: "customRules",
  });

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">Custom Rules</h3>
            <p className="text-sm text-muted-foreground">
              Define complex business rules that apply to your KPI calculations
            </p>
          </div>
          <Button type="button" onClick={onAddRule} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-6 bg-muted/20 rounded-md">
            <p className="text-muted-foreground">No custom rules defined</p>
            <Button type="button" onClick={onAddRule} variant="outline" className="mt-2">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Rule
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {fields.map((field, index) => (
              <CustomRuleRow
                key={field.id}
                control={control}
                index={index}
                onRemove={() => onRemoveRule(index)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
