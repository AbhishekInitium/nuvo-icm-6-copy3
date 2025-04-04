
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Control, useFieldArray } from "react-hook-form";
import { FieldEntryRow } from "./FieldEntryRow";
import { KpiConfigFormValues } from "@/hooks/useKpiConfiguratorForm";

interface FieldsSectionProps {
  control: Control<KpiConfigFormValues>;
  section: "baseData" | "qualificationFields" | "adjustmentFields" | "exclusionFields";
  title: string;
  description: string;
  onAddField: () => void;
  onRemoveField: (index: number) => void;
}

export function FieldsSection({ 
  control, 
  section, 
  title, 
  description, 
  onAddField, 
  onRemoveField 
}: FieldsSectionProps) {
  // Use field array to manage the dynamic fields
  const { fields } = useFieldArray({
    control,
    name: section,
  });

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button type="button" onClick={onAddField} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>

        <div className="space-y-6">
          {fields.map((field, index) => (
            <FieldEntryRow
              key={field.id}
              control={control}
              section={section}
              index={index}
              onRemove={() => onRemoveField(index)}
              showRemoveButton={fields.length > 1 || section !== "baseData"}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
