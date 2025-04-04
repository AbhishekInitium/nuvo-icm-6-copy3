
import { useState } from 'react';
import { z } from 'zod';
import { SchemeFormData } from '@/types/scheme';

// Zod schema for form validation
const schemeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  startDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: 'Invalid start date',
  }),
  endDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: 'Invalid end date',
  }),
  kpis: z.array(
    z.object({
      name: z.string().min(1, 'KPI name is required'),
      weight: z.number().min(0).max(100),
      threshold: z.number().min(0),
      target: z.number().min(0),
      max: z.number().min(0),
    })
  ).optional(),
});

export type FormErrors = {
  [key: string]: string;
};

export function useSchemeForm(initialData?: Partial<SchemeFormData>) {
  const [formData, setFormData] = useState<Partial<SchemeFormData>>(initialData || {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    kpis: [],
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState(0);
  
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const validate = (data: Partial<SchemeFormData> = formData): boolean => {
    try {
      schemeSchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: FormErrors = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };
  
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  return {
    formData,
    errors,
    currentStep,
    updateField,
    validate,
    nextStep,
    prevStep,
  };
}
