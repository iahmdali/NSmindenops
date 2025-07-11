
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ImageUpload } from "./image-upload"

const gantryReportSchema = z.object({
  report_date: z.date({ required_error: 'A date for the report is required.' }),
  shift: z.string({ required_error: 'Shift is required.' }),
  zone_leads: z.array(z.object({
    name: z.string().min(1, "Name is required."),
    time: z.string().min(1, "Time period is required."),
  })).min(1, "At least one zone lead is required."),
  personnel: z.array(z.object({
    employee_name: z.string().min(1, "Employee name is required."),
    start_time: z.string().min(1, "Start time is required."),
    end_time: z.string().min(1, "End time is required."),
  })).min(1, "At least one person is required."),
  recognition: z.array(z.object({
    employee_name: z.string().min(1, "Employee name is required."),
    reason: z.string().min(1, "Reason is required."),
  })).optional(),
  molds: z.array(z.object({
    mold_number: z.string().min(1, "Mold number is required."),
    sails: z.array(z.object({
      sail_number: z.string().min(1, "Sail number is required."),
      stage_of_process: z.string().min(1, "Stage of process is required."),
      issue: z.string().optional(),
    })).min(1, "At least one sail is required."),
  })).min(1, "At least one mold is required."),
  downtime: z.array(z.object({
    reason: z.string().min(1, "Reason is required."),
    duration_minutes: z.coerce.number().min(0, "Duration must be positive."),
  })).optional(),
  maintenance: z.array(z.object({
    description: z.string().min(1, "Description is required."),
    duration_minutes: z.coerce.number().min(0, "Duration must be positive."),
    images: z.any().optional(),
  })).optional(),
  general_images: z.any().optional(),
});

type GantryReportFormValues = z.infer<typeof gantryReportSchema>;

const defaultValues: Partial<GantryReportFormValues> = {
  report_date: new Date(),
  shift: "1",
  zone_leads: [{ name: "", time: "" }],
  personnel: [{ employee_name: "", start_time: "", end_time: "" }],
  recognition: [],
  molds: [{ mold_number: "", sails: [{ sail_number: "", stage_of_process: "", issue: "" }] }],
  downtime: [],
  maintenance: [],
};

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary">{title}</h3>
      <Card>
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

export function GantryReportForm() {
  const { toast } = useToast();
  const form = useForm<GantryReportFormValues>({
    resolver: zodResolver(gantryReportSchema),
    defaultValues,
  });

  const { fields: zoneLeadFields, append: appendZoneLead, remove: removeZoneLead } = useFieldArray({ control: form.control, name: "zone_leads" });
  const { fields: personnelFields, append: appendPersonnel, remove: removePersonnel } = useFieldArray({ control: form.control, name: "personnel" });
  const { fields: recognitionFields, append: appendRecognition, remove: removeRecognition } = useFieldArray({ control: form.control, name: "recognition" });
  const { fields: moldFields, append: appendMold, remove: removeMold } = useFieldArray({ control: form.control, name: "molds" });
  const { fields: downtimeFields, append: appendDowntime, remove: removeDowntime } = useFieldArray({ control: form.control, name: "downtime" });
  const { fields: maintenanceFields, append: appendMaintenance, remove: removeMaintenance } = useFieldArray({ control: form.control, name: "maintenance" });

  function onSubmit(values: GantryReportFormValues) {
    console.log(values);
    toast({
      title: "Gantry Report Submitted!",
      description: "Your detailed report has been successfully submitted.",
    });
    form.reset();
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <PageHeader title="Gantry Shift Report" description="Submit your shift report with production details and operational data."/>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FormField control={form.control} name="report_date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="shift" render={({ field }) => (<FormItem><FormLabel>Shift</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a shift" /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">Shift 1</SelectItem><SelectItem value="2">Shift 2</SelectItem><SelectItem value="3">Shift 3</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
        </div>
        
        <Section title="Zone Leads & Time">
          <div className="space-y-4">
            {zoneLeadFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md relative">
                <FormField control={form.control} name={`zone_leads.${index}.name`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Name</FormLabel><FormControl><Input placeholder="Zone lead name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`zone_leads.${index}.time`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Time</FormLabel><FormControl><Input placeholder="Time period" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeZoneLead(index)}><Trash2 className="size-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendZoneLead({ name: '', time: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Zone Lead</Button>
          </div>
        </Section>
        
        <Section title="Personnel">
          <div className="space-y-4">
            {personnelFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md relative">
                <FormField control={form.control} name={`personnel.${index}.employee_name`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Employee Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`personnel.${index}.start_time`} render={({ field }) => (<FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`personnel.${index}.end_time`} render={({ field }) => (<FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removePersonnel(index)}><Trash2 className="size-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendPersonnel({ employee_name: '', start_time: '', end_time: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Personnel</Button>
          </div>
        </Section>
        
        <Section title="Atta Boy/Girl">
          <div className="space-y-4">
            {recognitionFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md relative">
                <FormField control={form.control} name={`recognition.${index}.employee_name`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Employee Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`recognition.${index}.reason`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Reason</FormLabel><FormControl><Input placeholder="Reason for recognition" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeRecognition(index)}><Trash2 className="size-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendRecognition({ employee_name: '', reason: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Atta Boy/Girl</Button>
          </div>
        </Section>

        <Section title="Shift Productivity - Molds">
          <div className="space-y-6">
            {moldFields.map((moldField, moldIndex) => (
              <MoldField key={moldField.id} moldIndex={moldIndex} control={form.control} removeMold={removeMold} />
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendMold({ mold_number: '', sails: [{ sail_number: '', stage_of_process: '', issue: '' }] })}><PlusCircle className="mr-2 h-4 w-4" />Add Mold</Button>
          </div>
        </Section>
        
        <Section title="Downtime & Reason">
           <div className="space-y-4">
            {downtimeFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md relative">
                <FormField control={form.control} name={`downtime.${index}.reason`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Reason</FormLabel><FormControl><Input placeholder="Downtime reason" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`downtime.${index}.duration_minutes`} render={({ field }) => (<FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeDowntime(index)}><Trash2 className="size-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendDowntime({ reason: '', duration_minutes: 0 })}><PlusCircle className="mr-2 h-4 w-4" />Add Downtime</Button>
          </div>
        </Section>

        <Section title="Maintenance">
            <div className="space-y-4">
            {maintenanceFields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-4 p-4 border rounded-md relative">
                 <div className="flex items-end gap-4">
                    <FormField control={form.control} name={`maintenance.${index}.description`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Maintenance description" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`maintenance.${index}.duration_minutes`} render={({ field }) => (<FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeMaintenance(index)}><Trash2 className="size-4" /></Button>
                 </div>
                 <FormField
                    control={form.control}
                    name={`maintenance.${index}.images`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance Visual Log</FormLabel>
                        <FormControl>
                          <ImageUpload 
                            value={field.value} 
                            onChange={field.onChange} 
                            maxFiles={5}
                            maxSize={5 * 1024 * 1024}
                            />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendMaintenance({ description: '', duration_minutes: 0, images:[] })}><PlusCircle className="mr-2 h-4 w-4" />Add Maintenance</Button>
          </div>
        </Section>

        <Section title="Images">
            <FormField
                control={form.control}
                name="general_images"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Visual Log</FormLabel>
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

function MoldField({ moldIndex, control, removeMold }: { moldIndex: number, control: any, removeMold: (index: number) => void }) {
  const { fields: sailFields, append: appendSail, remove: removeSail } = useFieldArray({
    control,
    name: `molds.${moldIndex}.sails`
  });
  
  return (
    <Card className="p-4 bg-muted/30" key={`mold-${moldIndex}`}>
       <div className="flex items-end gap-4 mb-4">
            <FormField
                control={control}
                name={`molds.${moldIndex}.mold_number`}
                render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormLabel>Mold Number</FormLabel>
                        <FormControl><Input placeholder="Mold number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeMold(moldIndex)}><Trash2 className="size-4" /></Button>
        </div>
        <div className="space-y-2 pl-4 border-l-2 ml-2">
           <FormLabel>Sails</FormLabel>
           {sailFields.map((sailField, sailIndex) => (
               <div key={sailField.id} className="flex items-end gap-2 p-2 border rounded-md relative bg-background">
                   <FormField control={control} name={`molds.${moldIndex}.sails.${sailIndex}.sail_number`} render={({ field }) => (<FormItem className="flex-1"><FormLabel className="text-xs">Sail Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                   <FormField control={control} name={`molds.${moldIndex}.sails.${sailIndex}.stage_of_process`} render={({ field }) => (<FormItem className="flex-1"><FormLabel className="text-xs">Stage of Process</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                   <FormField control={control} name={`molds.${moldIndex}.sails.${sailIndex}.issue`} render={({ field }) => (<FormItem className="flex-1"><FormLabel className="text-xs">Issues</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                   <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeSail(sailIndex)}><Trash2 className="size-4" /></Button>
               </div>
           ))}
           <Button type="button" variant="outline" size="sm" onClick={() => appendSail({ sail_number: '', stage_of_process: '', issue: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Sail</Button>
        </div>
    </Card>
  )
}

function PageHeader({ title, description }: { title: string, description: string }) {
  return (
    <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline text-primary">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
