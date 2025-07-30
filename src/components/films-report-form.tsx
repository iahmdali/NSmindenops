
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { PlusCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"

const sailEntrySchema = z.object({
  sail_number: z.string().min(1, "Sail# is required."),
  comments: z.string().optional(),
});

const filmsReportSchema = z.object({
  report_date: z.date({ required_error: 'A date for the report is required.' }),
  gantry_number: z.string().min(1, "Gantry selection is required."),
  sails_started: z.array(sailEntrySchema).optional(),
  sails_finished: z.array(sailEntrySchema).optional(),
});

type FilmsReportFormValues = z.infer<typeof filmsReportSchema>;

const defaultValues: Partial<FilmsReportFormValues> = {
  report_date: new Date(),
  gantry_number: "",
  sails_started: [],
  sails_finished: [],
};

const gantryOptions = [ "4", "5", "6", "7", "8" ];

function SailListSection({
  title,
  fields,
  append,
  remove,
  control,
  name
}: {
  title: string,
  fields: any[],
  append: (data: any) => void,
  remove: (index: number) => void,
  control: any,
  name: "sails_started" | "sails_finished"
}) {
  return (
    <Card className="bg-muted/40">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ sail_number: '', comments: '' })}>
            <PlusCircle className="mr-2 h-4 w-4" />Add Sail
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-3 p-3 border rounded-md bg-background">
            <div className="grid gap-2 flex-1">
              <FormField
                control={control}
                name={`${name}.${index}.sail_number`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Sail#</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Sail#" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={control}
                name={`${name}.${index}.comments`}
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="sr-only">Comments</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional comments..." {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => remove(index)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-4">No sails added to this list.</p>
        )}
      </CardContent>
    </Card>
  )
}


export function FilmsReportForm() {
  const { toast } = useToast();
  const form = useForm<FilmsReportFormValues>({
    resolver: zodResolver(filmsReportSchema),
    defaultValues,
  });

  const { fields: startedFields, append: appendStarted, remove: removeStarted } = useFieldArray({
    control: form.control,
    name: "sails_started"
  });

  const { fields: finishedFields, append: appendFinished, remove: removeFinished } = useFieldArray({
    control: form.control,
    name: "sails_finished"
  });

  function onSubmit(values: FilmsReportFormValues) {
    console.log(values);
    toast({
      title: "Films Report Submitted!",
      description: "Your report has been successfully submitted.",
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">3D Films Shift Report</CardTitle>
                <CardDescription>Enter daily report details for the Films Department.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="report_date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="gantry_number" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Gantry #</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a Gantry" /></SelectTrigger></FormControl>
                            <SelectContent>{gantryOptions.map(opt => <SelectItem key={opt} value={opt}>Gantry {opt}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                 )} />
            </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
          <SailListSection
            title="Sails Started"
            fields={startedFields}
            append={appendStarted}
            remove={removeStarted}
            control={form.control}
            name="sails_started"
          />
          <SailListSection
            title="Sails Finished"
            fields={finishedFields}
            append={appendFinished}
            remove={removeFinished}
            control={form.control}
            name="sails_finished"
          />
        </div>

        <div className="flex justify-end gap-4">
            <Button type="submit" size="lg">Submit Report</Button>
        </div>
      </form>
    </Form>
  )
}
