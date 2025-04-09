
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/api/client";

// Field entry schema
const fieldEntrySchema = z.object({
  kpiName: z.string().min(1, "KPI name is required"),
  description: z.string().optional(),
  sourceType: z.enum(["SAP", "External"]),
  sourceField: z.string().min(1, "Source field is required"),
  dataType: z.enum(["Number", "String", "Date"]),
  apiEndpoint: z.string().optional(),
});

// KPI Config schema
const kpiConfigSchema = z.object({
  adminName: z.string().min(3, "Admin name must be at least 3 characters"),
  calculationBase: z.string().min(1, "Calculation base is required"),
  baseField: z.string().min(1, "Base field is required"),
  baseData: z.array(fieldEntrySchema),
  qualificationFields: z.array(fieldEntrySchema),
  adjustmentFields: z.array(fieldEntrySchema),
  exclusionFields: z.array(fieldEntrySchema),
  customRules: z.array(
    z.object({
      kpiName: z.string().min(1, "Rule name is required"),
      description: z.string().optional(),
      criteria: z.string().min(1, "Criteria is required"),
    })
  ),
});

export type FieldEntry = z.infer<typeof fieldEntrySchema>;
export type CustomRule = {
  kpiName: string;
  description?: string;
  criteria: string;
};
export type KpiConfigFormValues = z.infer<typeof kpiConfigSchema>;

// Initial empty field entry
const emptyFieldEntry: FieldEntry = {
  kpiName: "",
  description: "",
  sourceType: "SAP",
  sourceField: "",
  dataType: "Number",
  apiEndpoint: "",
};

// Initial empty custom rule
const emptyCustomRule: CustomRule = {
  kpiName: "",
  description: "",
  criteria: "",
};

// Initial form values
const defaultValues: KpiConfigFormValues = {
  adminName: "",
  calculationBase: "",
  baseField: "",
  baseData: [{ ...emptyFieldEntry }],
  qualificationFields: [],
  adjustmentFields: [],
  exclusionFields: [],
  customRules: [],
};

export function useKpiConfiguratorForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<KpiConfigFormValues>({
    resolver: zodResolver(kpiConfigSchema),
    defaultValues,
    mode: "onChange",
  });

  // Helper to add a field to a specific section
  const addField = (section: keyof KpiConfigFormValues) => {
    if (
      section === "baseData" ||
      section === "qualificationFields" ||
      section === "adjustmentFields" ||
      section === "exclusionFields"
    ) {
      const currentFields = form.getValues(section);
      form.setValue(section, [...currentFields, { ...emptyFieldEntry }]);
    } else if (section === "customRules") {
      const currentRules = form.getValues("customRules");
      form.setValue("customRules", [...currentRules, { ...emptyCustomRule }]);
    }
  };

  // Helper to remove a field from a specific section
  const removeField = (section: keyof KpiConfigFormValues, index: number) => {
    if (
      section === "baseData" ||
      section === "qualificationFields" ||
      section === "adjustmentFields" ||
      section === "exclusionFields" ||
      section === "customRules"
    ) {
      const currentFields = form.getValues(section);
      if (currentFields.length > 1 || section !== "baseData") {
        form.setValue(
          section,
          currentFields.filter((_, i) => i !== index)
        );
      } else {
        toast({
          title: "Cannot remove all fields",
          description: "You must have at least one field in this section",
          variant: "destructive",
        });
      }
    }
  };

  // Submit handler
  const onSubmit = async (values: KpiConfigFormValues) => {
    setIsSubmitting(true);

    try {
      // Prepare payload with client ID and timestamps
      const payload = {
        ...values,
        adminId: crypto.randomUUID(), // This would typically come from the user's session
        clientId: "client_001", // Updated to match the client ID used in interceptor
      };

      console.log("Submitting KPI config:", payload);

      // Submit to API with the correct endpoint path
      const response = await apiClient.post("/integration/kpi-config", payload);
      console.log("API Response:", response.data);

      toast({
        title: "Configuration created",
        description: "Your KPI configuration has been saved successfully.",
      });

      // Redirect to a confirmation page or list
      navigate("/kpi-configurations");
    } catch (error) {
      console.error("Error submitting configuration:", error);
      toast({
        title: "Error saving configuration",
        description: "There was a problem saving your configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    addField,
    removeField,
    onSubmit: form.handleSubmit(onSubmit),
    emptyFieldEntry,
    emptyCustomRule,
  };
}
