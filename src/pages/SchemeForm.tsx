
import { Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchemeBasicInfo } from '@/components/scheme/SchemeBasicInfo';
import { SchemeDateRange } from '@/components/scheme/SchemeDateRange';
import { SchemeMetrics } from '@/components/scheme/SchemeMetrics';
import { SchemeConfig } from '@/components/scheme/SchemeConfig';
import { SchemeFormActions } from '@/components/scheme/SchemeFormActions';
import { RuleBuilder } from '@/components/scheme/RuleBuilder';
import { CreditSplitTable } from '@/components/scheme/CreditSplitTable';
import { PayoutTierBuilder } from '@/components/scheme/PayoutTierBuilder';
import { useSchemeForm } from '@/hooks/useSchemeForm';
import { useState, useEffect } from 'react';

export function SchemeForm({ isEditing = false }) {
  const { form, isSubmitting, isLoadingScheme, onSubmit, handleCancel } = useSchemeForm(isEditing);
  const [configSelected, setConfigSelected] = useState(false);
  const [payoutTiers, setPayoutTiers] = useState([]);
  const [creditSplits, setCreditSplits] = useState([]);
  const [qualifyingRules, setQualifyingRules] = useState([]);
  const [adjustmentRules, setAdjustmentRules] = useState([]);
  const [exclusionRules, setExclusionRules] = useState([]);
  const [isPercentageRate, setIsPercentageRate] = useState(true);
  
  // Sample fields for rule builders
  const sampleFields = [
    { id: "product", name: "Product", type: "string" },
    { id: "productCategory", name: "Product Category", type: "string" },
    { id: "orderValue", name: "Order Value", type: "number" },
    { id: "customerType", name: "Customer Type", type: "string" },
    { id: "region", name: "Region", type: "string" }
  ];
  
  // Watch for config selection
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'configName' && value.configName) {
        setConfigSelected(true);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  if (isEditing && isLoadingScheme) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? 'Edit Scheme' : 'Create New Scheme'}
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Scheme Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <SchemeBasicInfo control={form.control} />
              <SchemeDateRange control={form.control} />
              <SchemeMetrics control={form.control} />
              <SchemeConfig control={form.control} />
              
              {configSelected && (
                <Tabs defaultValue="qualifying" className="mt-8">
                  <TabsList className="grid grid-cols-5 mb-4">
                    <TabsTrigger value="qualifying">Qualifying Criteria</TabsTrigger>
                    <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
                    <TabsTrigger value="exclusions">Exclusions</TabsTrigger>
                    <TabsTrigger value="credits">Credit Distribution</TabsTrigger>
                    <TabsTrigger value="payouts">Payout Structure</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="qualifying">
                    <RuleBuilder
                      title="Qualifying Criteria"
                      fields={sampleFields}
                      rules={qualifyingRules}
                      onChange={setQualifyingRules}
                    />
                  </TabsContent>
                  
                  <TabsContent value="adjustments">
                    <RuleBuilder
                      title="Adjustment Rules"
                      fields={sampleFields}
                      rules={adjustmentRules}
                      onChange={setAdjustmentRules}
                    />
                  </TabsContent>
                  
                  <TabsContent value="exclusions">
                    <RuleBuilder
                      title="Exclusion Rules"
                      fields={sampleFields}
                      rules={exclusionRules}
                      onChange={setExclusionRules}
                    />
                  </TabsContent>
                  
                  <TabsContent value="credits">
                    <CreditSplitTable
                      creditSplits={creditSplits}
                      onChange={setCreditSplits}
                    />
                  </TabsContent>
                  
                  <TabsContent value="payouts">
                    <PayoutTierBuilder
                      tiers={payoutTiers}
                      isPercentageRate={isPercentageRate}
                      onChange={setPayoutTiers}
                      onToggleRateType={setIsPercentageRate}
                    />
                  </TabsContent>
                </Tabs>
              )}
              
              <SchemeFormActions 
                isSubmitting={isSubmitting} 
                isEditing={isEditing} 
                onCancel={handleCancel} 
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SchemeForm;
