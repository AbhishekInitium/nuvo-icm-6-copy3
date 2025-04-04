
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Field {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
}

export interface CreditRule {
  id: string;
  field: string;
  operator: string;
  value: string | number;
}

interface CreditRuleBuilderProps {
  fields: Field[];
  rules: CreditRule[];
  onChange: (rules: CreditRule[]) => void;
}

export function CreditRuleBuilder({ fields, rules, onChange }: CreditRuleBuilderProps) {
  // Get available operators based on field type
  const getOperatorsForFieldType = (fieldType: string) => {
    const commonOperators = [
      { value: '=', label: 'Equals' },
      { value: '!=', label: 'Not Equals' },
    ];
    
    const stringOperators = [
      { value: 'contains', label: 'Contains' },
      { value: 'not_contains', label: 'Not Contains' },
      { value: 'starts_with', label: 'Starts With' },
    ];
    
    switch (fieldType) {
      case 'string':
        return [...commonOperators, ...stringOperators];
      default:
        return commonOperators;
    }
  };

  // Add a new rule
  const addRule = () => {
    const newRule: CreditRule = {
      id: crypto.randomUUID(),
      field: fields.length > 0 ? fields[0].id : '',
      operator: '=',
      value: '',
    };
    onChange([...rules, newRule]);
  };

  // Remove a rule
  const removeRule = (id: string) => {
    onChange(rules.filter(rule => rule.id !== id));
  };

  // Update a rule
  const updateRule = (id: string, field: keyof CreditRule, value: string | number) => {
    onChange(
      rules.map(rule => 
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    );
  };

  // Get the type of a field by its id
  const getFieldType = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    return field?.type || 'string';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Credit Attribution Rules</CardTitle>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="flex justify-center p-4 text-sm text-muted-foreground">
            No credit rules defined. Click "Add Rule" to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map(rule => {
              const fieldType = getFieldType(rule.field);
              const operators = getOperatorsForFieldType(fieldType);
              
              return (
                <div key={rule.id} className="flex items-center gap-2">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <Select 
                      value={rule.field} 
                      onValueChange={(value) => updateRule(rule.id, 'field', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map(field => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={rule.operator} 
                      onValueChange={(value) => updateRule(rule.id, 'operator', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map(op => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="text"
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                      placeholder="Enter value"
                    />
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="mt-4 w-full"
          onClick={addRule}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Credit Rule
        </Button>
      </CardContent>
    </Card>
  );
}
