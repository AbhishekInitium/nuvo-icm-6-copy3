
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { schemeApi } from '@/api/schemes';
import { SchemeFormData } from '@/types/scheme';

// Form validation schema
const schemeFormSchema = z.object({
  name: z.string().min(3, { message: 'Scheme name must be at least 3 characters' }),
  description: z.string().optional(),
  effectiveStart: z.date({ required_error: 'Start date is required' }),
  effectiveEnd: z.date({ required_error: 'End date is required' }),
  quotaAmount: z.coerce.number().min(0, { message: 'Quota amount must be positive' }),
  revenueBase: z.string({ required_error: 'Revenue base is required' }),
  configName: z.string({ required_error: 'Config name is required' }),
});

export type SchemeFormValues = z.infer<typeof schemeFormSchema>;

export function useSchemeForm(isEditing = false) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Default form values
  const defaultValues: Partial<SchemeFormValues> = {
    name: '',
    description: '',
    quotaAmount: 0,
    revenueBase: '',
  };
  
  // Initialize form
  const form = useForm<SchemeFormValues>({
    resolver: zodResolver(schemeFormSchema),
    defaultValues,
  });
  
  // Get existing scheme when editing
  const { data: existingScheme, isLoading: isLoadingScheme } = useQuery({
    queryKey: ['scheme', id],
    queryFn: () => schemeApi.getScheme(id as string),
    enabled: !!id && isEditing,
  });
  
  // Reset form with existing data when editing
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
  
  // Create scheme mutation
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
      return await schemeApi.createScheme(schemeData);
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
  
  // Update scheme mutation
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
      return await schemeApi.updateScheme(id as string, schemeData);
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
  
  // Submit handler
  const onSubmit = (data: SchemeFormValues) => {
    setIsSubmitting(true);
    
    if (isEditing && id) {
      updateSchemeMutation.mutate(data);
    } else {
      createSchemeMutation.mutate(data);
    }
  };
  
  // Cancel handler
  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/schemes/${id}`);
    } else {
      navigate('/schemes');
    }
  };
  
  return {
    form,
    isSubmitting,
    isLoadingScheme,
    onSubmit,
    handleCancel,
  };
}

export { schemeFormSchema };
