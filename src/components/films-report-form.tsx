
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
import { ImageUpload } from "./image-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Checkbox } from "./ui/checkbox"

const crewMemberSchema = z.object({ 
    name: z.string().min(1, "Name is required."),
    shift_time: z.string().min(1, "Shift time is required."),
    crew_type: z.enum(["Films Crew", "Joining Crew"]),
});

const sailPrepSchema = z.object({
  gantry_mold: z.string().min(1, "Gantry/MOLD selection is required."),
  sail_number: z.string().min(1, "Sail number is required."),
  status_in_progress: z.boolean().default(false),
  status_done: z.boolean().default(false),
  issue_notes: z.string().optional(),
});

const filmsReportSchema = z.object({
  report_date: z.date({ required_error: 'A date for the report is required.' }),
  shift_lead_name: z.string().min(1, "Shift lead name is required."),
  shift_type: z.enum(["Morning", "Night"]),
  oops_report_info: z.string().optional(),
  crew_members: z.array(crewMemberSchema).min(1, "At least one crew member is required."),
  sail_preparations: z.array(sailPrepSchema).optional(),
  images: z.any().optional(),
});

type FilmsReportFormValues = z.infer<typeof filmsReportSchema>;

const defaultValues: Partial<FilmsReportFormValues> = {
  report_date: new Date(),
  shift_lead_name: "",
  shift_type: "Morning",
  crew_members: [],
  sail_preparations: [],
  oops_report_info: "",
  images: [],
};

const gantryMoldOptions = [
    "Gantry 4 / MOLD 105",
    "Gantry 6 / MOLD 109",
    "Gantry 6 / MOLD 110",
    "Gantry 7 / MOLD 111",
    "Gantry 8 / MOLD 100",
];

function Section({ title, description, children, actions }: { title: string, description?: string, children: React.ReactNode, actions?: React.ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-xl text-primary">{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                     {actions}
                </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

export function FilmsReportForm() {
  const { toast } = useToast();
  const form = useForm<FilmsReportFormValues>({
    resolver: zodResolver(filmsReportSchema),
    defaultValues,
  });

  const { fields: crewFields, append: appendCrew, remove: removeCrew } = useFieldArray({ control: form.control, name: "crew_members" });
  const { fields: sailPrepFields, append: appendSailPrep, remove: removeSailPrep } = useFieldArray({
      control: form.control,
      name: "sail_preparations"
  });

  function onSubmit(values: FilmsReportFormValues) {
    console.log(values);
    toast({
      title: "Films Report Submitted!",
      description: "Your simplified report has been successfully submitted.",
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
        
        <Section title="Crew Members" actions={<Button type="button" variant="outline" size="sm" onClick={() => appendCrew({ name: '', shift_time: '', crew_type: 'Films Crew' })}><PlusCircle className="mr-2 h-4 w-4" />Add Crew</Button>}>
            <div className="space-y-4">
            {crewFields.map((field, index) => (
                 <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md relative bg-muted/30">
                    <FormField control={form.control} name={`crew_members.${index}.name`} render={({ field }) => (
                        <FormItem className="flex-1"><FormLabel>Name</FormLabel><FormControl><Input placeholder="Crew member name" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`crew_members.${index}.shift_time`} render={({ field }) => (
                        <FormItem className="flex-1"><FormLabel>Shift Time</FormLabel><FormControl><Input placeholder="e.g., 06:00 - 14:00" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name={`crew_members.${index}.crew_type`} render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Crew Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Films Crew">Films Crew</SelectItem><SelectItem value="Joining Crew">Joining Crew</SelectItem></SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeCrew(index)}><Trash2 className="size-4" /></Button>
                </div>
            ))}
             {crewFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No crew members added.</p>}
        </div>
        </Section>
        
        <Section title="Sail Preparation Tracking" actions={<Button type="button" variant="outline" size="sm" onClick={() => appendSailPrep({ gantry_mold: "", sail_number: "", status_in_progress: true, status_done: false, issue_notes: "" })}><PlusCircle className="mr-2 h-4 w-4" />Add Sail</Button>}>
            <div className="space-y-4">
                {sailPrepFields.map((field, index) => (
                    <div key={field.id} className="grid items-start md:grid-cols-4 gap-4 p-4 border rounded-md relative bg-muted/30">
                        <FormField control={form.control} name={`sail_preparations.${index}.gantry_mold`} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gantry/MOLD</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Gantry/MOLD" /></SelectTrigger></FormControl>
                                    <SelectContent>{gantryMoldOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name={`sail_preparations.${index}.sail_number`} render={({ field }) => (
                            <FormItem><FormLabel>Sail # (Film)</FormLabel><FormControl><Input placeholder="Sail number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="space-y-2 pt-2">
                             <FormLabel>Status</FormLabel>
                             <div className="flex gap-4 pt-2">
                                <FormField control={form.control} name={`sail_preparations.${index}.status_in_progress`} render={({ field }) => (<FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>In Progress</FormLabel></FormItem>)} />
                                <FormField control={form.control} name={`sail_preparations.${index}.status_done`} render={({ field }) => (<FormItem className="flex items-center space-x-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Done</FormLabel></FormItem>)} />
                             </div>
                        </div>
                         <FormField control={form.control} name={`sail_preparations.${index}.issue_notes`} render={({ field }) => (
                            <FormItem><FormLabel>Issue Notes</FormLabel><FormControl><Input placeholder="e.g., Wrinkle, jam..." {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive shrink-0" onClick={() => removeSailPrep(index)}><Trash2 className="size-4" /></Button>
                    </div>
                ))}
                {sailPrepFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No sail preparations logged.</p>}
            </div>
        </Section>
        
        <Section title="OOPS Report">
            <FormField control={form.control} name="oops_report_info" render={({ field }) => (<FormItem><FormLabel>OOPS Report / Info</FormLabel><FormControl><Textarea placeholder="Details on any OOPS reports, safety violations, or other incidents..." {...field} /></FormControl><FormMessage /></FormItem>)} />
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
    

    
