
import { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

export interface PayoutTier {
  id: string;
  fromValue: number;
  toValue: number;
  rate: number;
}

interface PayoutTierBuilderProps {
  tiers: PayoutTier[];
  isPercentageRate: boolean;
  onChange: (tiers: PayoutTier[]) => void;
  onToggleRateType: (isPercentage: boolean) => void;
}

export function PayoutTierBuilder({ 
  tiers, 
  isPercentageRate, 
  onChange, 
  onToggleRateType 
}: PayoutTierBuilderProps) {
  const [hasOverlap, setHasOverlap] = useState(false);
  const [maxPayout, setMaxPayout] = useState(0);

  useEffect(() => {
    // Check for overlaps
    const sortedTiers = [...tiers].sort((a, b) => a.fromValue - b.fromValue);
    let hasOverlap = false;
    
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      if (sortedTiers[i].toValue > sortedTiers[i + 1].fromValue) {
        hasOverlap = true;
        break;
      }
    }
    
    setHasOverlap(hasOverlap);
    
    // Calculate max payout (simple calculation for demonstration)
    if (isPercentageRate) {
      // For percentage rate, just show the highest tier rate
      const highestRate = tiers.reduce((max, tier) => 
        tier.rate > max ? tier.rate : max, 0);
      setMaxPayout(highestRate);
    } else {
      // For fixed payout, sum up all tiers
      const totalPayout = tiers.reduce((sum, tier) => 
        sum + tier.rate, 0);
      setMaxPayout(totalPayout);
    }
  }, [tiers, isPercentageRate]);

  const addTier = () => {
    // Find the highest "to" value to set as the new "from" value
    const maxTo = tiers.reduce((max, tier) => 
      tier.toValue > max ? tier.toValue : max, 0);
    
    const newTier: PayoutTier = {
      id: crypto.randomUUID(),
      fromValue: maxTo,
      toValue: maxTo + 10,
      rate: 0,
    };
    
    onChange([...tiers, newTier]);
  };

  const removeTier = (id: string) => {
    onChange(tiers.filter(tier => tier.id !== id));
  };

  const updateTier = (id: string, field: keyof PayoutTier, value: string | number) => {
    onChange(
      tiers.map(tier => {
        if (tier.id === id) {
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          return { ...tier, [field]: isNaN(numValue) ? 0 : numValue };
        }
        return tier;
      })
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Payout Structure</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Switch 
              id="rate-type" 
              checked={isPercentageRate}
              onCheckedChange={onToggleRateType}
            />
            <Label htmlFor="rate-type">
              {isPercentageRate ? 'Percentage of Achievement' : 'Fixed Amount Payout'}
            </Label>
          </div>
          
          <div className="text-sm">
            Max Payout: <span className="font-medium">
              {isPercentageRate ? `${maxPayout}%` : `$${maxPayout.toFixed(2)}`}
            </span>
          </div>
        </div>

        {hasOverlap && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tier ranges should not overlap. Please adjust the values.
            </AlertDescription>
          </Alert>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left px-2 py-3 text-sm font-medium text-muted-foreground">From (%)</th>
                <th className="text-left px-2 py-3 text-sm font-medium text-muted-foreground">To (%)</th>
                <th className="text-left px-2 py-3 text-sm font-medium text-muted-foreground">
                  {isPercentageRate ? 'Rate (%)' : 'Payout ($)'}
                </th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {tiers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-sm text-muted-foreground">
                    No payout tiers defined. Click "Add Tier" to create one.
                  </td>
                </tr>
              ) : (
                tiers.map(tier => (
                  <tr key={tier.id}>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={tier.fromValue}
                        onChange={(e) => updateTier(tier.id, 'fromValue', e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min={tier.fromValue}
                        step="1"
                        value={tier.toValue}
                        onChange={(e) => updateTier(tier.id, 'toValue', e.target.value)}
                        placeholder="100"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step={isPercentageRate ? "0.01" : "1"}
                        value={tier.rate}
                        onChange={(e) => updateTier(tier.id, 'rate', e.target.value)}
                        placeholder={isPercentageRate ? "0.00" : "0"}
                      />
                    </td>
                    <td className="p-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeTier(tier.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Button 
          variant="outline" 
          className="mt-4 w-full"
          onClick={addTier}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Tier
        </Button>
      </CardContent>
    </Card>
  );
}
