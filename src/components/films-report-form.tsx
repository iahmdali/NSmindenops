
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, Controller } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ImageUpload } from "./image-upload"
import { Separator } from "./ui/separator"

const sailEntrySchema = z.object({
  sail_number: z.string().min(1, "Sail number is required."),
  status_note: z.string().optional(),
});

const gantrySailsSchema = z.object({
  started: z.array(sailEntrySchema).optional(),
  finished: z.array(sailEntrySchema).optional(),
});

const filmsReportSchema = z.object({
  report_date: z.date({ required_error: 'A date for the report is required.' }),
  morning_briefing: z.string().optional(),
  weekly_topic: z.string().optional(),
  on_shift_crew: z.array(z.object({ name: z.string().min(1, "Name is required.") })).optional(),
  joining_crew: z.array(z.object({ name: z.string().min(1, "Name is required.") })).optional(),
  oops_notes: z.string().optional(),
  six_minutes_of_safety: z.string().optional(),
  gantries: z.object({
    gantry_4: gantrySailsSchema,
    gantry_5: gantrySailsSchema,
    gantry_6: gantrySailsSchema,
    gantry_7: gantrySailsSchema,
    gantry_8: gantrySailsSchema,
  }),
  images: z.any().optional(),
});

type FilmsReportFormValues = z.infer<typeof filmsReportSchema>;

const defaultValues: Partial<FilmsReportFormValues> = {
  report_date: new Date(),
  morning_briefing: "",
  weekly_topic: "",
  on_shift_crew: [],
  joining_crew: [],
  oops_notes: "",
  six_minutes_of_safety: "",
  gantries: {
    gantry_4: { started: [], finished: [] },
    gantry_5: { started: [], finished: [] },
    gantry_6: { started: [], finished: [] },
    gantry_7: { started: [], finished: [] },
    gantry_8: { started: [], finished: [] },
  },
  images: [],
};

function Section({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

function CrewList({ name, control, title }: { name: "on_shift_crew" | "joining_crew", control: any, title: string }) {
    const { fields, append, remove } = useFieldArray({ control, name });
    
    return (
        <div className="space-y-4">
            <h4 className="font-semibold">{title}</h4>
            {fields.map((field, index) => (
                 <div key={field.id} className="flex items-center gap-2">
                    <FormField control={control} name={`${name}.${index}.name`} render={({ field }) => (
                        <FormItem className="flex-1"><FormControl><Input placeholder="Crew member name" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => remove(index)}><Trash2 className="size-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Crew</Button>
        </div>
    )
}

function GantrySails({ gantryName, control }: { gantryName: `gantries.gantry_${4|5|6|7|8}`, control: any }) {
    const { fields: startedFields, append: appendStarted, remove: removeStarted } = useFieldArray({ control, name: `${gantryName}.started` });
    const { fields: finishedFields, append: appendFinished, remove: removeFinished } = useFieldArray({ control, name: `${gantryName}.finished` });

    return (
        <Card className="bg-muted/30">
            <CardHeader>
                <CardTitle className="text-lg">Gantry {gantryName.split('_')[1]}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h4 className="font-medium">Sails Started</h4>
                    {startedFields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2 p-2 border rounded-md bg-background">
                            <div className="flex-1 space-y-2">
                                <FormField control={control} name={`${gantryName}.started.${index}.sail_number`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Sail Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={control} name={`${gantryName}.started.${index}.status_note`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Status Note (Optional)</FormLabel><FormControl><Input placeholder="e.g., Recook, Jammed..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeStarted(index)}><Trash2 className="size-4" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendStarted({ sail_number: '', status_note: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Started Sail</Button>
                </div>
                <div className="space-y-2">
                    <h4 className="font-medium">Sails Finished</h4>
                    {finishedFields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2 p-2 border rounded-md bg-background">
                           <div className="flex-1 space-y-2">
                                <FormField control={control} name={`${gantryName}.finished.${index}.sail_number`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Sail Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={control} name={`${gantryName}.finished.${index}.status_note`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Status Note (Optional)</FormLabel><FormControl><Input placeholder="e.g., Recook, Jammed..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeFinished(index)}><Trash2 className="size-4" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendFinished({ sail_number: '', status_note: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Finished Sail</Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function FilmsReportForm() {
  const { toast } = useToast();
  const form = useForm<FilmsReportFormValues>({
    resolver: zodResolver(filmsReportSchema),
    defaultValues,
  });

  function onSubmit(values: FilmsReportFormValues) {
    console.log(values);
    toast({
      title: "Films Report Submitted!",
      description: "Your detailed report has been successfully submitted.",
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
            <CardContent>
                 <FormField control={form.control} name="report_date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Section title="Morning Briefing"><FormField control={form.control} name="morning_briefing" render={({ field }) => (<FormItem><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>)} /></Section>
            <Section title="Weekly Topic"><FormField control={form.control} name="weekly_topic" render={({ field }) => (<FormItem><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>)}/></Section>
        </div>

        <Section title="Crew Members">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CrewList name="on_shift_crew" control={form.control} title="On-Shift Crew" />
                <CrewList name="joining_crew" control={form.control} title="Joining Crew" />
            </div>
        </Section>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Section title="OOPS Report"><FormField control={form.control} name="oops_notes" render={({ field }) => (<FormItem><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>)} /></Section>
            <Section title="6 Minutes of Safety"><FormField control={form.control} name="six_minutes_of_safety" render={({ field }) => (<FormItem><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>)}/></Section>
        </div>

        <Section title="Sails Started / Finished" description="Track sail production for each gantry.">
            <div className="space-y-4">
                <GantrySails gantryName="gantries.gantry_4" control={form.control} />
                <GantrySails gantryName="gantries.gantry_5" control={form.control} />
                <GantrySails gantryName="gantries.gantry_6" control={form.control} />
                <GantrySails gantryName="gantries.gantry_7" control={form.control} />
                <GantrySails gantryName="gantries.gantry_8" control={form.control} />
            </div>
        </Section>
        
        <Section title="Visual Log" description="Upload up to 10 images (max 5MB each).">
            <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <ImageUpload 
                            value={field.value} 
                            onChange={field.onChange} 
                            maxFiles={10}
                            maxSize={5 * 1024 * 1024}
                            />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </Section>

        <Button type="submit" size="lg">Submit Report</Button>
      </form>
    </Form>
  )
}
