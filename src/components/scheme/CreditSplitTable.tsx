
import { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface CreditSplit {
  id: string;
  role: string;
  percentage: number;
}

interface CreditSplitTableProps {
  creditSplits: CreditSplit[];
  onChange: (creditSplits: CreditSplit[]) => void;
}

export function CreditSplitTable({ creditSplits, onChange }: CreditSplitTableProps) {
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const total = creditSplits.reduce((sum, split) => sum + (Number(split.percentage) || 0), 0);
    setTotalPercentage(total);
    setIsValid(Math.abs(total - 100) < 0.01); // Allow for small floating point differences
  }, [creditSplits]);

  const addCreditSplit = () => {
    const newSplit: CreditSplit = {
      id: crypto.randomUUID(),
      role: '',
      percentage: 0,
    };
    onChange([...creditSplits, newSplit]);
  };

  const removeCreditSplit = (id: string) => {
    onChange(creditSplits.filter(split => split.id !== id));
  };

  const updateCreditSplit = (id: string, field: keyof CreditSplit, value: string | number) => {
    onChange(
      creditSplits.map(split => {
        if (split.id === id) {
          if (field === 'percentage') {
            const numValue = parseFloat(value.toString());
            return { ...split, [field]: isNaN(numValue) ? 0 : numValue };
          }
          return { ...split, [field]: value };
        }
        return split;
      })
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Credit Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {!isValid && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Total credit percentage must equal 100%. Current total: {totalPercentage.toFixed(2)}%
            </AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left px-2 py-3 text-sm font-medium text-muted-foreground">Role / Participant</th>
                <th className="text-left px-2 py-3 text-sm font-medium text-muted-foreground w-32">Percentage (%)</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {creditSplits.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-sm text-muted-foreground">
                    No credit distribution defined. Click "Add Row" to create one.
                  </td>
                </tr>
              ) : (
                creditSplits.map(split => (
                  <tr key={split.id}>
                    <td className="p-2">
                      <Input
                        type="text"
                        value={split.role}
                        onChange={(e) => updateCreditSplit(split.id, 'role', e.target.value)}
                        placeholder="Enter role (e.g., Sales Rep)"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={split.percentage}
                        onChange={(e) => updateCreditSplit(split.id, 'percentage', e.target.value)}
                        placeholder="0.00"
                      />
                    </td>
                    <td className="p-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeCreditSplit(split.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td className="text-right font-medium p-2">Total:</td>
                <td className={`font-medium p-2 ${!isValid ? 'text-destructive' : ''}`}>
                  {totalPercentage.toFixed(2)}%
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <Button 
          variant="outline" 
          className="mt-4 w-full"
          onClick={addCreditSplit}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Row
        </Button>
      </CardContent>
    </Card>
  );
}
