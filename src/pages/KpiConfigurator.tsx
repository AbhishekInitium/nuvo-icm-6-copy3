
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useKpiConfiguratorForm } from "@/hooks/useKpiConfiguratorForm";
import { ConfiguratorBasicInfo } from "@/components/kpi-configurator/ConfiguratorBasicInfo";
import { FieldsSection } from "@/components/kpi-configurator/FieldsSection";
import { CustomRulesSection } from "@/components/kpi-configurator/CustomRulesSection";

export function KpiConfigurator() {
  const { 
    form, 
    isSubmitting, 
    addField, 
    removeField, 
    onSubmit 
  } = useKpiConfiguratorForm();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">KPI Configuration</h1>
          <p className="text-muted-foreground">
            Define how KPI data is gathered and calculated for incentive schemes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create KPI Configuration</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-8">
              {/* Basic Information Section */}
              <ConfiguratorBasicInfo control={form.control} />

              {/* Base Data Section */}
              <FieldsSection
                control={form.control}
                section="baseData"
                title="Base Data"
                description="Define the primary data fields used for calculations"
                onAddField={() => addField("baseData")}
                onRemoveField={(index) => removeField("baseData", index)}
              />

              {/* Qualification Fields Section */}
              <FieldsSection
                control={form.control}
                section="qualificationFields"
                title="Qualifying Criteria"
                description="Fields used to determine if a record qualifies for incentive calculation"
                onAddField={() => addField("qualificationFields")}
                onRemoveField={(index) => removeField("qualificationFields", index)}
              />

              {/* Adjustment Fields Section */}
              <FieldsSection
                control={form.control}
                section="adjustmentFields"
                title="Adjustment Fields"
                description="Fields that modify the incentive calculation"
                onAddField={() => addField("adjustmentFields")}
                onRemoveField={(index) => removeField("adjustmentFields", index)}
              />

              {/* Exclusion Fields Section */}
              <FieldsSection
                control={form.control}
                section="exclusionFields"
                title="Exclusion Fields"
                description="Fields that may exclude records from incentive calculation"
                onAddField={() => addField("exclusionFields")}
                onRemoveField={(index) => removeField("exclusionFields", index)}
              />

              {/* Custom Rules Section */}
              <CustomRulesSection
                control={form.control}
                onAddRule={() => addField("customRules")}
                onRemoveRule={(index) => removeField("customRules", index)}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Configuration
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default KpiConfigurator;
