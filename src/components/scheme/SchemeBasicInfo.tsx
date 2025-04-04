
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { SchemeFormValues } from "@/hooks/useSchemeForm";

interface SchemeBasicInfoProps {
  control: Control<SchemeFormValues>;
}

export function SchemeBasicInfo({ control }: SchemeBasicInfoProps) {
  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Scheme Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter scheme name" {...field} />
            </FormControl>
            <FormDescription>
              A descriptive name for your incentive scheme
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter scheme description" 
                className="resize-none" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Optional details about the incentive scheme
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
