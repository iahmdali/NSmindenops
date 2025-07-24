
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
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ImageUpload } from "./image-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { Checkbox } from "./ui/checkbox"

const crewMemberSchema = z.object({ 
    name: z.string().min(1, "Name is required."),
    shift_time: z.string().min(1, "Shift time is required."),
    crew_type: z.enum(["Films Crew", "Joining Crew"]),
});

const sailEntrySchema = z.object({
  sail_number: z.string().min(1, "Sail number is required."),
  status: z.array(z.string()).optional(),
  issue_notes: z.string().optional(),
});

const finishedSailSchema = z.object({
  sail_number: z.string().min(1, "Sail number is required."),
  remarks: z.string().optional(),
});


const gantrySailsSchema = z.object({
  in_progress: z.array(sailEntrySchema).optional(),
  finished: z.array(finishedSailSchema).optional(),
});

const filmsReportSchema = z.object({
  report_date: z.date({ required_error: 'A date for the report is required.' }),
  shift_lead_name: z.string().min(1, "Shift lead name is required."),
  shift_type: z.enum(["Morning", "Night"]),
  morning_briefing: z.string().optional(),
  weekly_topic: z.string().optional(),
  six_minutes_of_safety: z.string().optional(),
  oops_report_info: z.string().optional(),
  crew_members: z.array(crewMemberSchema).min(1, "At least one crew member is required."),
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
  shift_lead_name: "",
  shift_type: "Morning",
  crew_members: [],
  gantries: {
    gantry_4: { in_progress: [], finished: [] },
    gantry_5: { in_progress: [], finished: [] },
    gantry_6: { in_progress: [], finished: [] },
    gantry_7: { in_progress: [], finished: [] },
    gantry_8: { in_progress: [], finished: [] },
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

function CrewList({ control }: { control: any }) {
    const { fields, append, remove } = useFieldArray({ control, name: "crew_members" });
    
    return (
        <div className="space-y-4">
            {fields.map((field, index) => (
                 <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md relative">
                    <FormField control={control} name={`crew_members.${index}.name`} render={({ field }) => (
                        <FormItem className="flex-1"><FormLabel>Name</FormLabel><FormControl><Input placeholder="Crew member name" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={control} name={`crew_members.${index}.shift_time`} render={({ field }) => (
                        <FormItem className="flex-1"><FormLabel>Shift Time</FormLabel><FormControl><Input placeholder="e.g., 06:00 - 14:00" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={control} name={`crew_members.${index}.crew_type`} render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Crew Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Films Crew">Films Crew</SelectItem><SelectItem value="Joining Crew">Joining Crew</SelectItem></SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => remove(index)}><Trash2 className="size-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', shift_time: '', crew_type: 'Films Crew' })}><PlusCircle className="mr-2 h-4 w-4" />Add Crew</Button>
        </div>
    )
}

function GantryWorkSection({ gantryName, control }: { gantryName: `gantries.gantry_${4|5|6|7|8}`, control: any }) {
    const { fields: inProgressFields, append: appendInProgress, remove: removeInProgress } = useFieldArray({ control, name: `${gantryName}.in_progress` });
    const { fields: finishedFields, append: appendFinished, remove: removeFinished } = useFieldArray({ control, name: `${gantryName}.finished` });

    return (
        <AccordionItem value={gantryName}>
            <AccordionTrigger className="text-lg font-medium">Gantry {gantryName.split('_')[1]}</AccordionTrigger>
            <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                    <div className="space-y-2 rounded-md border p-4">
                        <h4 className="font-medium">Sails In Progress / Done</h4>
                        {inProgressFields.map((field, index) => (
                            <div key={field.id} className="flex flex-col gap-2 p-3 border rounded-md bg-background relative">
                                <FormField control={control} name={`${gantryName}.in_progress.${index}.sail_number`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Sail #</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={control} name={`${gantryName}.in_progress.${index}.status`} render={() => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Status</FormLabel>
                                        <div className="flex gap-4 pt-2">
                                        {["In Progress", "Done"].map(item => (
                                            <FormField key={item} control={control} name={`${gantryName}.in_progress.${index}.status`} render={({ field }) => (
                                                <FormItem key={item} className="flex flex-row items-start space-x-2 space-y-0">
                                                <FormControl><Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item]) : field.onChange(field.value?.filter((value) => value !== item)) }} /></FormControl>
                                                <FormLabel className="font-normal">{item}</FormLabel>
                                                </FormItem>
                                            )} />
                                        ))}
                                        </div>
                                    </FormItem>
                                )}/>

                                <FormField control={control} name={`${gantryName}.in_progress.${index}.issue_notes`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Issue Notes</FormLabel><FormControl><Input placeholder="e.g., Wrinkle, Recook needed..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive shrink-0" onClick={() => removeInProgress(index)}><Trash2 className="size-4" /></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendInProgress({ sail_number: '', status: ['In Progress'], issue_notes: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Sail</Button>
                    </div>
                    <div className="space-y-2 rounded-md border p-4">
                        <h4 className="font-medium">Additional Completed Sails</h4>
                        {finishedFields.map((field, index) => (
                            <div key={field.id} className="flex flex-col gap-2 p-3 border rounded-md bg-background relative">
                               <FormField control={control} name={`${gantryName}.finished.${index}.sail_number`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Sail # (Finished)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                               <FormField control={control} name={`${gantryName}.finished.${index}.remarks`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Remarks</FormLabel><FormControl><Input placeholder="e.g., Finished early..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                               <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive shrink-0" onClick={() => removeFinished(index)}><Trash2 className="size-4" /></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendFinished({ sail_number: '', remarks: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Finished Sail</Button>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
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
    // form.reset(); // Commented out for easier testing
  }
  
  function handleSaveDraft() {
    console.log("Saving draft:", form.getValues());
    toast({
      title: "Draft Saved!",
      description: "Your report draft has been saved.",
    });
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">3D Films Shift Report</CardTitle>
                <CardDescription>Enter daily report details for the Films Department.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
                 <FormField control={form.control} name="report_date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="shift_lead_name" render={({ field }) => (<FormItem><FormLabel>Shift Lead Name</FormLabel><FormControl><Input placeholder="Lead's name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="shift_type" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Shift Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Morning">Morning</SelectItem><SelectItem value="Night">Night</SelectItem></SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                 )} />
            </CardContent>
        </Card>
        
        <Section title="Briefing & Notes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="morning_briefing" render={({ field }) => (<FormItem><FormLabel>Morning Briefing</FormLabel><FormControl><Textarea placeholder="Notes from the morning briefing..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="weekly_topic" render={({ field }) => (<FormItem><FormLabel>Weekly Topic</FormLabel><FormControl><Textarea placeholder="Topic for the week..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="six_minutes_of_safety" render={({ field }) => (<FormItem><FormLabel>Six Minutes of Safety</FormLabel><FormControl><Textarea placeholder="Safety notes..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="oops_report_info" render={({ field }) => (<FormItem><FormLabel>OOPS Report / Info</FormLabel><FormControl><Textarea placeholder="Details on any OOPS reports..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
        </Section>
        
        <Section title="Crew Members">
           <CrewList control={form.control} />
        </Section>
        
        <Section title="Current Work Section" description="Log sail progress for each gantry.">
            <Accordion type="multiple" className="w-full">
                <GantryWorkSection gantryName="gantries.gantry_4" control={form.control} />
                <GantryWorkSection gantryName="gantries.gantry_5" control={form.control} />
                <GantryWorkSection gantryName="gantries.gantry_6" control={form.control} />
                <GantryWorkSection gantryName="gantries.gantry_7" control={form.control} />
                <GantryWorkSection gantryName="gantries.gantry_8" control={form.control} />
            </Accordion>
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

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
            <Button type="submit" size="lg">Submit Report</Button>
        </div>
      </form>
    </Form>
  )
}
    

    