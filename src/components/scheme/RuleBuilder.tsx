
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import styles from '@/styles/ruleBuilder.module.css';

export interface Field {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
}

export interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string | number;
}

interface RuleBuilderProps {
  title: string;
  fields: Field[];
  rules: Rule[];
  onChange: (rules: Rule[]) => void;
}

export function RuleBuilder({ title, fields, rules, onChange }: RuleBuilderProps) {
  // Get available operators based on field type
  const getOperatorsForFieldType = (fieldType: string) => {
    const commonOperators = [
      { value: '=', label: 'Equals' },
      { value: '!=', label: 'Not Equals' },
    ];
    
    const numberOperators = [
      { value: '>', label: 'Greater Than' },
      { value: '<', label: 'Less Than' },
      { value: '>=', label: 'Greater Than or Equal' },
      { value: '<=', label: 'Less Than or Equal' },
    ];
    
    const stringOperators = [
      { value: 'contains', label: 'Contains' },
      { value: 'not_contains', label: 'Not Contains' },
      { value: 'starts_with', label: 'Starts With' },
      { value: 'ends_with', label: 'Ends With' },
    ];
    
    switch (fieldType) {
      case 'number':
        return [...commonOperators, ...numberOperators];
      case 'string':
        return [...commonOperators, ...stringOperators];
      case 'boolean':
        return commonOperators;
      case 'date':
        return [...commonOperators, ...numberOperators];
      default:
        return commonOperators;
    }
  };

  // Add a new rule
  const addRule = () => {
    const newRule: Rule = {
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
  const updateRule = (id: string, field: keyof Rule, value: string | number) => {
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
    <div className={styles.ruleCard}>
      <div className={styles.ruleHeader}>
        <h3 className={styles.ruleTitle}>{title}</h3>
      </div>
      <div className={styles.ruleContent}>
        {rules.length === 0 ? (
          <div className={styles.noRules}>
            No rules defined. Click "Add Rule" to create one.
          </div>
        ) : (
          <div className={styles.ruleList}>
            {rules.map(rule => {
              const fieldType = getFieldType(rule.field);
              const operators = getOperatorsForFieldType(fieldType);
              
              return (
                <div key={rule.id} className={styles.ruleItem}>
                  <div className={styles.ruleGrid}>
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
                      type={fieldType === 'number' ? 'number' : 'text'}
                      value={rule.value}
                      onChange={(e) => updateRule(
                        rule.id, 
                        'value', 
                        fieldType === 'number' ? parseFloat(e.target.value) : e.target.value
                      )}
                      placeholder="Enter value"
                    />
                  </div>
                  
                  <button 
                    className={styles.removeButton}
                    onClick={() => removeRule(rule.id)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
        <button 
          className={styles.addRuleButton}
          onClick={addRule}
          type="button"
        >
          <Plus size={16} /> Add Rule
        </button>
      </div>
    </div>
  );
}
