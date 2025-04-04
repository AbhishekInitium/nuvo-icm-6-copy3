
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { schemeApi } from '@/api/schemes';
import { Scheme } from '@/types/scheme';

interface ImportSchemeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportSchemeModal({ open, onOpenChange }: ImportSchemeModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }
    
    if (!selectedFile.name.endsWith('.json')) {
      setFileError('Please select a JSON file');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      setFileError('Please select a file to import');
      return;
    }

    setIsUploading(true);
    
    try {
      // Read file content
      const fileContent = await file.text();
      let schemeData: any;
      
      try {
        schemeData = JSON.parse(fileContent);
      } catch (error) {
        throw new Error('Invalid JSON file');
      }
      
      // Basic validation - ensure it has required fields
      if (!schemeData.name || !schemeData.effectiveStart || !schemeData.effectiveEnd) {
        throw new Error('Invalid scheme file format');
      }
      
      // Clear sensitive or unnecessary fields
      delete schemeData.id;
      delete schemeData.schemeId;
      delete schemeData.createdAt;
      delete schemeData.updatedAt;
      
      // Set as draft
      schemeData.status = 'Draft';
      
      // Mark as imported if it had an original id
      if (schemeData.versionOf) {
        schemeData.versionOf = schemeData.versionOf;
      }
      
      // Import the scheme
      await schemeApi.createScheme(schemeData);
      
      // Success notification
      toast({
        title: 'Scheme imported successfully',
        description: `"${schemeData.name}" has been imported as a draft scheme`,
      });
      
      // Refresh the schemes list
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
      
      // Close modal and reset
      onOpenChange(false);
      setFile(null);
    } catch (error) {
      console.error('Import error:', error);
      setFileError(error instanceof Error ? error.message : 'Failed to import scheme');
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import scheme',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileError(null);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Scheme</DialogTitle>
          <DialogDescription>
            Upload a previously exported scheme JSON file to import it as a new draft scheme.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {file ? (
            <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              <Button variant="ghost" size="sm" onClick={clearFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label 
                htmlFor="scheme-file" 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">JSON files only</p>
                </div>
                <input
                  id="scheme-file"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}
          
          {fileError && (
            <p className="text-sm text-destructive">{fileError}</p>
          )}
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || isUploading}>
            {isUploading ? 'Importing...' : 'Import Scheme'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
