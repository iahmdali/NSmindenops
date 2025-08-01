
"use client"

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { DatePicker } from "../ui/date-picker";
import { Input } from "../ui/input";

export function InspectionMetadata() {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspection Metadata</CardTitle>
        <CardDescription>Top-level information for each individual sail section.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-6">
        <FormField
          control={control}
          name="inspectionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inspection Date</FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="oeNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OE# (Order Entry Number)</FormLabel>
              <FormControl>
                <Input placeholder="Enter OE#" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="inspectorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inspector Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
