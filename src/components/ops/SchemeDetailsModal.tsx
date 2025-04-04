
import { Scheme } from '@/types/scheme';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SchemeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: Scheme;
}

export function SchemeDetailsModal({ isOpen, onClose, scheme }: SchemeDetailsModalProps) {
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'Approved':
        return <Badge variant="success">Approved</Badge>;
      case 'Simulated':
        return <Badge variant="outline">Simulated</Badge>;
      case 'ProdRun':
        return <Badge variant="default">Production Run</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {scheme.name} {renderStatusBadge(scheme.status)}
          </DialogTitle>
          <DialogDescription>
            Scheme ID: {scheme.schemeId || scheme.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Description</h3>
            <p>{scheme.description || 'No description provided.'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Effective Period</h3>
            <p>
              {format(new Date(scheme.effectiveStart), 'PPP')} to {format(new Date(scheme.effectiveEnd), 'PPP')}
            </p>
          </div>
        </div>
        
        <Separator />
        
        <div className="py-4">
          <h3 className="text-sm font-semibold mb-3">Configuration Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quota Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${scheme.quotaAmount.toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue Base</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{scheme.revenueBase}</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Separator />
        
        <div className="py-4">
          <h3 className="text-sm font-semibold mb-3">Payout Structure</h3>
          {scheme.payoutStructure.tiers ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">From</th>
                  <th className="text-left p-2">To</th>
                  <th className="text-left p-2">
                    {scheme.payoutStructure.isPercentage ? 'Percentage' : 'Amount'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {scheme.payoutStructure.tiers.map((tier, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{tier.from}%</td>
                    <td className="p-2">{tier.to === Infinity ? 'Infinity' : `${tier.to}%`}</td>
                    <td className="p-2">
                      {scheme.payoutStructure.isPercentage ? `${tier.value}%` : `$${tier.value}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted-foreground">No payout structure defined.</p>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
