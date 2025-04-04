
import { Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SchemeBasicInfo } from '@/components/scheme/SchemeBasicInfo';
import { SchemeDateRange } from '@/components/scheme/SchemeDateRange';
import { SchemeMetrics } from '@/components/scheme/SchemeMetrics';
import { SchemeConfig } from '@/components/scheme/SchemeConfig';
import { SchemeFormActions } from '@/components/scheme/SchemeFormActions';
import { useSchemeForm } from '@/hooks/useSchemeForm';

export function SchemeForm({ isEditing = false }) {
  const { form, isSubmitting, isLoadingScheme, onSubmit, handleCancel } = useSchemeForm(isEditing);
  
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
