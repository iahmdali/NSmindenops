
"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function InspectionMetadata() {
  const { control } = useFormContext();

  const inspectors = ["Inspector 1", "Inspector 2", "Inspector 3"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Inspection Metadata</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-6">
        <FormField
          control={control}
          name="inspection_date"
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
          name="oe_number"
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
          name="inspector_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inspector Name</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Inspector" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {inspectors.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
