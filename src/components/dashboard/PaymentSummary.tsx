
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";

interface PaymentSummaryProps {
  currentEarnings: number;
  priorBalance: number;
  totalPayout: number;
}

export function PaymentSummary({ 
  currentEarnings, 
  priorBalance, 
  totalPayout 
}: PaymentSummaryProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle>Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                This Period's Earnings
              </p>
              <p className="text-sm text-muted-foreground">
                Apr 1 - Apr 15, 2025
              </p>
            </div>
            <div className="flex items-center gap-1 text-emerald-500">
              <ArrowUpRight className="h-4 w-4" />
              <span className="font-medium">{formatCurrency(currentEarnings)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                Prior Balance
              </p>
              <p className="text-sm text-muted-foreground">
                From previous periods
              </p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="font-medium">{formatCurrency(priorBalance)}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-base font-medium leading-none">
                  Total Payout
                </p>
                <p className="text-sm text-muted-foreground">
                  To be processed on Apr 30
                </p>
              </div>
              <div className="flex items-center gap-1 font-bold text-lg">
                <DollarSign className="h-4 w-4" />
                <span>{formatCurrency(totalPayout)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
