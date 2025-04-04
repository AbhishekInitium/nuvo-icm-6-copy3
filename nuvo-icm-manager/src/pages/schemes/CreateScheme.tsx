
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchemeForm } from '@/hooks/useSchemeForm';
import { schemeApi } from '@/api/schemes';

export function CreateScheme() {
  const navigate = useNavigate();
  const { formData, errors, currentStep, updateField, validate, nextStep, prevStep } = useSchemeForm();
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    { name: 'Basic Info', component: <BasicInfoForm formData={formData} errors={errors} updateField={updateField} /> },
    { name: 'KPI Setup', component: <KpiSetupForm formData={formData} errors={errors} updateField={updateField} /> },
    { name: 'Review', component: <ReviewForm formData={formData} /> }
  ];

  const handleSubmit = async () => {
    const isValid = validate();
    if (!isValid) return;

    try {
      setSubmitting(true);
      await schemeApi.createScheme(formData as any); // Type assertion here
      navigate('/schemes');
    } catch (error) {
      console.error('Error creating scheme:', error);
      alert('Failed to create scheme. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Incentive Scheme</h1>

      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex-1 text-center pb-2 ${
                index === currentStep 
                  ? 'border-b-2 border-primary font-medium' 
                  : 'text-muted-foreground'
              }`}
            >
              {step.name}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].name}</CardTitle>
        </CardHeader>
        <CardContent>
          {steps[currentStep].component}

          <div className="flex justify-between mt-8">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
            ) : (
              <div></div>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={() => {
                  if (validate()) nextStep();
                }}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Scheme'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Step 1: Basic Information
function BasicInfoForm({ formData, errors, updateField }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Scheme Name *</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Enter scheme name"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          className="w-full p-2 border rounded-md"
          rows={3}
          placeholder="Enter scheme description"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date *</label>
          <input
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => updateField('startDate', e.target.value)}
            className="w-full p-2 border rounded-md"
          />
          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">End Date *</label>
          <input
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => updateField('endDate', e.target.value)}
            className="w-full p-2 border rounded-md"
          />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
        </div>
      </div>
    </div>
  );
}

// Step 2: KPI Setup
function KpiSetupForm({ formData, errors, updateField }: any) {
  const addKpi = () => {
    const kpis = [...(formData.kpis || [])];
    kpis.push({
      name: '',
      weight: 0,
      threshold: 0,
      target: 0,
      max: 0,
    });
    updateField('kpis', kpis);
  };

  const updateKpi = (index: number, field: string, value: any) => {
    const kpis = [...(formData.kpis || [])];
    kpis[index] = { ...kpis[index], [field]: field === 'name' ? value : Number(value) };
    updateField('kpis', kpis);
  };

  const removeKpi = (index: number) => {
    const kpis = [...(formData.kpis || [])];
    kpis.splice(index, 1);
    updateField('kpis', kpis);
  };

  return (
    <div>
      <p className="mb-4 text-muted-foreground">Add key performance indicators (KPIs) for this incentive scheme.</p>
      
      {(formData.kpis || []).map((kpi: any, index: number) => (
        <div key={index} className="mb-6 p-4 border rounded-md">
          <div className="flex justify-between mb-2">
            <h3 className="text-lg font-medium">KPI #{index + 1}</h3>
            <Button variant="ghost" size="sm" onClick={() => removeKpi(index)}>Remove</Button>
          </div>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">KPI Name *</label>
              <input
                type="text"
                value={kpi.name}
                onChange={(e) => updateKpi(index, 'name', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., Sales Achievement"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Weight (%)</label>
                <input
                  type="number"
                  value={kpi.weight}
                  onChange={(e) => updateKpi(index, 'weight', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Threshold</label>
                <input
                  type="number"
                  value={kpi.threshold}
                  onChange={(e) => updateKpi(index, 'threshold', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target</label>
                <input
                  type="number"
                  value={kpi.target}
                  onChange={(e) => updateKpi(index, 'target', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Maximum</label>
                <input
                  type="number"
                  value={kpi.max}
                  onChange={(e) => updateKpi(index, 'max', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <Button variant="outline" onClick={addKpi} className="w-full mt-2">
        Add KPI
      </Button>
    </div>
  );
}

// Step 3: Review
function ReviewForm({ formData }: any) {
  return (
    <div>
      <p className="mb-4 text-muted-foreground">Review your scheme details below before submitting.</p>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Scheme Name</h3>
          <p>{formData.name}</p>
        </div>
        
        <div>
          <h3 className="font-medium">Description</h3>
          <p>{formData.description || 'N/A'}</p>
        </div>
        
        <div>
          <h3 className="font-medium">Date Range</h3>
          <p>{formData.startDate} to {formData.endDate}</p>
        </div>
        
        <div>
          <h3 className="font-medium">KPIs ({(formData.kpis || []).length})</h3>
          {(formData.kpis || []).length > 0 ? (
            <div className="space-y-2 mt-2">
              {(formData.kpis || []).map((kpi: any, index: number) => (
                <div key={index} className="p-3 bg-muted rounded-md">
                  <div className="font-medium">{kpi.name}</div>
                  <div className="text-sm">
                    Weight: {kpi.weight}%, Threshold: {kpi.threshold}, 
                    Target: {kpi.target}, Max: {kpi.max}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No KPIs defined</p>
          )}
        </div>
      </div>
    </div>
  );
}
