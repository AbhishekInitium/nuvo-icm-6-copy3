
import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface ApproveSchemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: Scheme;
  onApprove: (schemeId: string, notes?: string) => Promise<void>;
}

export function ApproveSchemeModal({ 
  isOpen, 
  onClose, 
  scheme, 
  onApprove 
}: ApproveSchemeModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await onApprove(scheme.schemeId || scheme.id, notes);
    } finally {
      setIsSubmitting(false);
      // onClose will be called by the parent component after successful approval
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Scheme</DialogTitle>
          <DialogDescription>
            You are about to approve the scheme "{scheme.name}". 
            Once approved, this scheme will be locked for editing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-amber-50 p-4 rounded-md mb-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Important:</h4>
              <p className="text-amber-700 text-sm mt-1">
                Approving a scheme means it is ready for production runs. 
                Please ensure all details are correct before proceeding.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Approval Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this approval..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Approving...' : 'Approve Scheme'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
