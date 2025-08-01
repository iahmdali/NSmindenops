
"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export function ReinspectionOutcome({ isVisible }: { isVisible: boolean }) {
  const { control } = useFormContext();

  if (!isVisible) return null;

  return (
    <Card className="border-yellow-400 border-2 bg-yellow-50/50 dark:bg-yellow-900/20">
      <CardHeader>
        <CardTitle>4. Reinspection Outcome & Final Decision</CardTitle>
        <CardDescription>
          The score requires a reinspection. Use this section to record the final decision and any corrective actions taken.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="reinspection_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Final Decision & Notes</FormLabel>
              <FormControl>
                <Textarea 
                    placeholder="e.g., 'Recooked', 'Accepted after Reinspection', 'Patched corner'..." 
                    {...field}
                    className="bg-background"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
