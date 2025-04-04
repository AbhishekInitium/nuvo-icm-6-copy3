
import { Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchemeBasicInfo } from '@/components/scheme/SchemeBasicInfo';
import { SchemeDateRange } from '@/components/scheme/SchemeDateRange';
import { SchemeMetrics } from '@/components/scheme/SchemeMetrics';
import { SchemeConfig } from '@/components/scheme/SchemeConfig';
import { SchemeFormActions } from '@/components/scheme/SchemeFormActions';
import { RuleBuilder, Field } from '@/components/scheme/RuleBuilder';
import { CreditSplitTable } from '@/components/scheme/CreditSplitTable';
import { PayoutTierBuilder } from '@/components/scheme/PayoutTierBuilder';
import { useSchemeForm } from '@/hooks/useSchemeForm';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function SchemeForm({ isEditing = false }) {
  const { form, isSubmitting, isLoadingScheme, onSubmit, handleCancel } = useSchemeForm(isEditing);
  const [configSelected, setConfigSelected] = useState(false);
  const [payoutTiers, setPayoutTiers] = useState([]);
  const [creditSplits, setCreditSplits] = useState([]);
  const [qualifyingRules, setQualifyingRules] = useState([]);
  const [adjustmentRules, setAdjustmentRules] = useState([]);
  const [exclusionRules, setExclusionRules] = useState([]);
  const [isPercentageRate, setIsPercentageRate] = useState(true);
  const { user } = useAuth();
  
  // Sample fields for rule builders with correct type literals
  const sampleFields: Field[] = [
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '16rem'
      }}>
        <Loader2 style={{
          width: '2rem',
          height: '2rem',
          animation: 'spin 1s linear infinite',
          color: '#004c97'
        }} />
      </div>
    );
  }
  
  return (
    <div style={{
      maxWidth: '48rem',
      margin: '0 auto'
    }}>
      <h1 style={{
        fontSize: '1.875rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: '#1a202c'
      }}>
        {isEditing ? 'Edit Scheme' : 'Create New Scheme'}
      </h1>
      
      <Card style={{
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <CardHeader>
          <CardTitle style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#004c97'
          }}>Scheme Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <SchemeBasicInfo control={form.control} />
              <SchemeDateRange control={form.control} />
              <SchemeMetrics control={form.control} />
              <SchemeConfig control={form.control} />
              
              {configSelected && (
                <Tabs defaultValue="qualifying" style={{
                  marginTop: '2rem'
                }}>
                  <TabsList className="grid grid-cols-5 mb-4" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <TabsTrigger value="qualifying" style={{
                      padding: '0.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontWeight: 'medium',
                      borderBottom: '2px solid transparent',
                      transition: 'all 0.2s'
                    }}>Qualifying Criteria</TabsTrigger>
                    <TabsTrigger value="adjustments" style={{
                      padding: '0.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontWeight: 'medium',
                      borderBottom: '2px solid transparent',
                      transition: 'all 0.2s'
                    }}>Adjustments</TabsTrigger>
                    <TabsTrigger value="exclusions" style={{
                      padding: '0.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontWeight: 'medium',
                      borderBottom: '2px solid transparent',
                      transition: 'all 0.2s'
                    }}>Exclusions</TabsTrigger>
                    <TabsTrigger value="credits" style={{
                      padding: '0.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontWeight: 'medium',
                      borderBottom: '2px solid transparent',
                      transition: 'all 0.2s'
                    }}>Credit Distribution</TabsTrigger>
                    <TabsTrigger value="payouts" style={{
                      padding: '0.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontWeight: 'medium',
                      borderBottom: '2px solid transparent',
                      transition: 'all 0.2s'
                    }}>Payout Structure</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="qualifying" style={{
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem'
                  }}>
                    <RuleBuilder
                      title="Qualifying Criteria"
                      fields={sampleFields}
                      rules={qualifyingRules}
                      onChange={setQualifyingRules}
                    />
                  </TabsContent>
                  
                  <TabsContent value="adjustments" style={{
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem'
                  }}>
                    <RuleBuilder
                      title="Adjustment Rules"
                      fields={sampleFields}
                      rules={adjustmentRules}
                      onChange={setAdjustmentRules}
                    />
                  </TabsContent>
                  
                  <TabsContent value="exclusions" style={{
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem'
                  }}>
                    <RuleBuilder
                      title="Exclusion Rules"
                      fields={sampleFields}
                      rules={exclusionRules}
                      onChange={setExclusionRules}
                    />
                  </TabsContent>
                  
                  <TabsContent value="credits" style={{
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem'
                  }}>
                    <CreditSplitTable
                      creditSplits={creditSplits}
                      onChange={setCreditSplits}
                    />
                  </TabsContent>
                  
                  <TabsContent value="payouts" style={{
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem'
                  }}>
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
