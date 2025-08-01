
"use client"

import { useFieldArray } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Textarea } from "../ui/textarea";

export function NewFoundDefects({ control }: { control: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "newFoundDefects"
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>New Found Defects</CardTitle>
                <CardDescription>Log any defects not on the standard list.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ panelNumber: '', scarfJoint: '', numberOfDefects: 0, defectScore: 0, comments: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Defect
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-lg relative space-y-4">
             <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-destructive"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={control}
                  name={`newFoundDefects.${index}.panelNumber`}
                  render={({ field }) => (
                    <FormItem><FormLabel>Panel Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`newFoundDefects.${index}.scarfJoint`}
                  render={({ field }) => (
                    <FormItem><FormLabel>Scarf Joint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`newFoundDefects.${index}.numberOfDefects`}
                  render={({ field }) => (
                    <FormItem><FormLabel>Number of Defects</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`newFoundDefects.${index}.defectScore`}
                  render={({ field }) => (
                    <FormItem><FormLabel>Defect Score</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )}
                />
            </div>
            <FormField
              control={control}
              name={`newFoundDefects.${index}.comments`}
              render={({ field }) => (
                <FormItem><FormLabel>Comments</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
          </div>
        ))}
        {fields.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No new defects added.</p>}
      </CardContent>
    </Card>
  );
}
