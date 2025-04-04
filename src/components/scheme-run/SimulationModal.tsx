
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Scheme } from '@/types/scheme-run';

interface SimulationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedScheme: Scheme | null;
  uploadFile: File | null;
  setUploadFile: (file: File | null) => void;
  onSubmit: () => void;
  isRunning: boolean;
}

export function SimulationModal({
  open,
  onOpenChange,
  selectedScheme,
  uploadFile,
  setUploadFile,
  onSubmit,
  isRunning
}: SimulationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Run Simulation</DialogTitle>
          <DialogDescription>
            Upload sample data to simulate the scheme execution without affecting real data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
            <p className="mb-2 text-sm text-gray-600">
              Upload CSV or Excel file with sample data
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90"
            >
              Choose File
            </label>
            {uploadFile && (
              <p className="mt-2 text-sm font-medium text-gray-800">
                Selected: {uploadFile.name}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={!uploadFile || isRunning}
          >
            {isRunning ? 'Running Simulation...' : 'Run Simulation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
