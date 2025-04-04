import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';
import { schemeApi } from '@/api/schemes';
import { apiClient } from '@/api/client';
import { cn } from '@/lib/utils';
import { SchemeFormData } from '@/types/scheme';

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

export function SchemeForm({ isEditing = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const clientId = 'client_XYZ';
  
  const { data: configsData, isLoading: configsLoading } = useQuery({
    queryKey: ['configs'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/configs');
      return response.data.data;
    },
  });
  
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
  
  const { data: existingScheme, isLoading: isLoadingScheme } = useQuery({
    queryKey: ['scheme', id],
    queryFn: () => schemeApi.getScheme(id as string),
    enabled: !!id && isEditing,
  });
  
  useEffect(() => {
    if (existingScheme && isEditing) {
      form.reset({
        name: existingScheme.name,
        description: existingScheme.description || '',
        effectiveStart: new Date(existingScheme.effectiveStart),
        effectiveEnd: new Date(existingScheme.effectiveEnd),
        quotaAmount: existingScheme.quotaAmount,
        revenueBase: existingScheme.revenueBase,
        configName: existingScheme.configName,
      });
    }
  }, [existingScheme, form, isEditing]);
  
  const createSchemeMutation = useMutation({
    mutationFn: async (data: SchemeFormValues) => {
      const schemeData: SchemeFormData = {
        name: data.name,
        description: data.description,
        effectiveStart: data.effectiveStart,
        effectiveEnd: data.effectiveEnd,
        quotaAmount: data.quotaAmount,
        revenueBase: data.revenueBase,
        configName: data.configName,
        status: 'Draft',
      };
      const response = await schemeApi.createScheme(schemeData);
      return response;
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
  
  const updateSchemeMutation = useMutation({
    mutationFn: async (data: SchemeFormValues) => {
      const schemeData: Partial<SchemeFormData> = {
        name: data.name,
        description: data.description,
        effectiveStart: data.effectiveStart,
        effectiveEnd: data.effectiveEnd,
        quotaAmount: data.quotaAmount,
        revenueBase: data.revenueBase,
        configName: data.configName,
      };
      const response = await schemeApi.updateScheme(id as string, schemeData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Scheme updated successfully',
      });
      navigate(`/schemes/${id}`);
    },
    onError: (error) => {
      console.error('Error updating scheme:', error);
      toast({
        title: 'Error',
        description: 'Failed to update scheme. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
  });
  
  const onSubmit = (data: SchemeFormValues) => {
    setIsSubmitting(true);
    
    if (isEditing && id) {
      updateSchemeMutation.mutate(data);
    } else {
      createSchemeMutation.mutate(data);
    }
  };
  
  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/schemes/${id}`);
    } else {
      navigate('/schemes');
    }
  };
  
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
                      onValueChange={field.onChange} 
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
              
              <CardFooter className="flex justify-between px-0 pb-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Update Scheme' : 'Create Scheme'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SchemeForm;
