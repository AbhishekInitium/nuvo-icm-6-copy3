import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';
import { cn } from '@/lib/utils';
import { RuleBuilder, Rule, Field } from '@/components/scheme/RuleBuilder';
import { CreditRuleBuilder, CreditRule } from '@/components/scheme/CreditRuleBuilder';
import { CreditSplitTable, CreditSplit } from '@/components/scheme/CreditSplitTable';
import { PayoutTierBuilder, PayoutTier } from '@/components/scheme/PayoutTierBuilder';
import { SchemeSimulationModal } from '@/components/scheme/SchemeSimulationModal';

const schemeFormSchema = z.object({
  name: z.string().min(3, { message: 'Scheme name must be at least 3 characters' }),
  description: z.string().optional(),
  effectiveStart: z.date({ required_error: 'Start date is required' }),
  effectiveEnd: z.date({ required_error: 'End date is required' }),
  quotaAmount: z.coerce.number().min(0, { message: 'Quota amount must be positive' }),
  revenueBase: z.string({ required_error: 'Revenue base is required' }),
  configName: z.string({ required_error: 'Config name is required' }),
});

type SchemeFormValues = z.infer<typeof schemeFormSchema>;

interface ConfigField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
}

interface ConfigDetails {
  adminName: string;
  qualificationFields: ConfigField[];
  adjustmentFields: ConfigField[];
  exclusionFields: ConfigField[];
  baseFields?: ConfigField[]; // Added for credit rules
}

export function SchemeForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [configDetails, setConfigDetails] = useState<ConfigDetails | null>(null);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  
  const [qualifyingRules, setQualifyingRules] = useState<Rule[]>([]);
  const [adjustmentRules, setAdjustmentRules] = useState<Rule[]>([]);
  const [exclusionRules, setExclusionRules] = useState<Rule[]>([]);
  
  const [creditRules, setCreditRules] = useState<CreditRule[]>([]);
  const [creditSplits, setCreditSplits] = useState<CreditSplit[]>([]);
  const [payoutTiers, setPayoutTiers] = useState<PayoutTier[]>([]);
  const [isPercentageRate, setIsPercentageRate] = useState(true);
  
  const clientId = 'client_XYZ';
  
  const { data: configsData, isLoading: configsLoading } = useQuery({
    queryKey: ['configs'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/configs');
      return response.data.data;
    },
  });
  
  const { data: configDetailsData, isLoading: configDetailsLoading } = useQuery({
    queryKey: ['config', selectedConfig],
    queryFn: async () => {
      if (!selectedConfig) return null;
      const response = await apiClient.get(`/admin/config/${selectedConfig}`);
      const data = response.data.data;
      data.baseFields = [
        { id: 'SalesRep', name: 'Sales Representative', type: 'string' },
        { id: 'SalesOrg', name: 'Sales Organization', type: 'string' },
        { id: 'Territory', name: 'Territory', type: 'string' },
        { id: 'Department', name: 'Department', type: 'string' },
      ];
      return data;
    },
    enabled: !!selectedConfig,
  });
  
  useEffect(() => {
    if (configDetailsData) {
      setConfigDetails(configDetailsData);
    }
  }, [configDetailsData]);
  
  const defaultValues: Partial<SchemeFormValues> = {
    name: '',
    description: '',
    quotaAmount: 0,
    revenueBase: '',
  };
  
  const form = useForm<SchemeFormValues>({
    resolver: zodResolver(schemeFormSchema),
    defaultValues,
  });
  
  const handleConfigChange = (config: string) => {
    setSelectedConfig(config);
    form.setValue('configName', config);
  };
  
  const createSchemeMutation = useMutation({
    mutationFn: async (data: SchemeFormValues) => {
      const schemeData = {
        ...data,
        clientId,
        status: 'Draft',
        qualifyingRules,
        adjustmentRules,
        exclusionRules,
        creditRules,
        creditSplits,
        payoutStructure: {
          isPercentageRate,
          tiers: payoutTiers
        }
      };
      const response = await apiClient.post('/manager/schemes', schemeData);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Scheme created successfully',
      });
      navigate('/schemes');
    },
    onError: (error) => {
      console.error('Error creating scheme:', error);
      toast({
        title: 'Error',
        description: 'Failed to create scheme. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
  });
  
  const onSubmit = (data: SchemeFormValues) => {
    setIsSubmitting(true);
    createSchemeMutation.mutate(data);
  };
  
  const handleCancel = () => {
    navigate('/schemes');
  };

  const prepareSimulationData = () => {
    const formValues = form.getValues();
    return {
      ...formValues,
      clientId,
      status: 'Draft',
      qualifyingRules,
      adjustmentRules,
      exclusionRules,
      creditRules,
      creditSplits,
      payoutStructure: {
        isPercentageRate,
        tiers: payoutTiers
      }
    };
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Scheme</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Scheme Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="rules" disabled={!selectedConfig}>Rules Configuration</TabsTrigger>
                  <TabsTrigger value="payout" disabled={!selectedConfig}>Payout Rules</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheme Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter scheme name" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for your incentive scheme
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter scheme description" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Optional details about the incentive scheme
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="effectiveStart"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Effective From</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="effectiveEnd"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Effective To</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                  
                  <FormField
                    control={form.control}
                    name="configName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Configuration</FormLabel>
                        <Select 
                          onValueChange={(value) => handleConfigChange(value)} 
                          defaultValue={field.value}
                          disabled={configsLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select configuration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {configsLoading ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="ml-2">Loading...</span>
                              </div>
                            ) : configsData && configsData.length > 0 ? (
                              configsData.map((config: any) => (
                                <SelectItem key={config.adminName} value={config.adminName}>
                                  {config.adminName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-configs" disabled>
                                No configurations available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the KPI configuration for this scheme
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="rules" className="space-y-6 pt-4">
                  {configDetailsLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading configuration details...</span>
                    </div>
                  ) : configDetails ? (
                    <>
                      <RuleBuilder
                        title="Qualifying Criteria"
                        fields={configDetails.qualificationFields || []}
                        rules={qualifyingRules}
                        onChange={setQualifyingRules}
                      />
                      
                      <RuleBuilder
                        title="Adjustment Rules"
                        fields={configDetails.adjustmentFields || []}
                        rules={adjustmentRules}
                        onChange={setAdjustmentRules}
                      />
                      
                      <RuleBuilder
                        title="Exclusion Rules"
                        fields={configDetails.exclusionFields || []}
                        rules={exclusionRules}
                        onChange={setExclusionRules}
                      />
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Select a configuration to set up rules
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="payout" className="space-y-6 pt-4">
                  {configDetailsLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading configuration details...</span>
                    </div>
                  ) : configDetails ? (
                    <>
                      <CreditRuleBuilder
                        fields={configDetails.baseFields || []}
                        rules={creditRules}
                        onChange={setCreditRules}
                      />
                      
                      <CreditSplitTable
                        creditSplits={creditSplits}
                        onChange={setCreditSplits}
                      />
                      
                      <PayoutTierBuilder
                        tiers={payoutTiers}
                        isPercentageRate={isPercentageRate}
                        onChange={setPayoutTiers}
                        onToggleRateType={setIsPercentageRate}
                      />
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Select a configuration to set up payout rules
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <CardFooter className="flex justify-between px-0 pb-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    disabled={isSubmitting || !selectedConfig}
                    onClick={() => setSimulationModalOpen(true)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Simulate
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Scheme
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      <SchemeSimulationModal 
        isOpen={simulationModalOpen}
        onClose={() => setSimulationModalOpen(false)}
        schemeData={prepareSimulationData()}
        onSuccess={() => {
          setSimulationModalOpen(false);
          form.handleSubmit(onSubmit)();
        }}
      />
    </div>
  );
}

export default SchemeForm;
