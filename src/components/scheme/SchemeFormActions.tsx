
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

interface SchemeFormActionsProps {
  isSubmitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

export function SchemeFormActions({ isSubmitting, isEditing, onCancel }: SchemeFormActionsProps) {
  return (
    <CardFooter className="flex justify-between px-0 pb-0">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? 'Update Scheme' : 'Create Scheme'}
      </Button>
    </CardFooter>
  );
}
