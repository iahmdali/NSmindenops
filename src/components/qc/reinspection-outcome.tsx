
"use client"

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function ReinspectionOutcome() {
  const { control } = useFormContext();

  return (
    <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20">
      <CardHeader>
        <CardTitle className="text-yellow-700 dark:text-yellow-300">Reinspection Outcome</CardTitle>
        <CardDescription>This section is active because the score requires a final judgment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="reinspection.finalOutcome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Final Outcome</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a final outcome..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="accepted">Accepted after Reinspection</SelectItem>
                  <SelectItem value="recooked">Recooked</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="reinspection.comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reinspection Comments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide comments on the final decision..."
                  {...field}
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
