"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form"
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
import { Checkbox } from "./ui/checkbox"

const workCategoryOptions = {
    "Cutting/Masking": ["Cutting", "Rolling", "Masking", "Weeding", "Printing"],
    "Inking": ["Assembled", "Layout", "Fold", "Unfold"],
} as const;

type WorkCategory = keyof typeof workCategoryOptions;

const graphicsReportSchema = z.object({
  report_date: z.date({ required_error: 'A date for the report is required.' }),
  personnel: z.array(z.object({
    name: z.string().min(1, "Name is required."),
    start_time: z.string().min(1, "Start time is required."),
    end_time: z.string().min(1, "End time is required."),
    note: z.string().optional(),
  })).min(1, "At least one person is required."),
  work_entries: z.array(z.object({
    tag_id: z.string().min(1, "Tag ID is required."),
    work_category: z.string().min(1, "Category is required."),
    work_type: z.string().min(1, "Type is required."),
    duration_hrs: z.coerce.number().optional(),
    personnel_count: z.coerce.number().optional(),
    tape_used: z.boolean().default(false),
    description: z.string().optional(),
  })).min(1, "At least one work entry is required."),
  boxed_shipped: z.array(z.object({
    name: z.string().min(1, "Item name is required."),
  })).optional(),
  maintenance: z.array(z.object({
    description: z.string().min(1, "Description is required."),
    duration_hrs: z.coerce.number().min(0, "Duration must be positive."),
    personnel_count: z.coerce.number().min(1, "Personnel count must be at least 1."),
  })).optional(),
  daily_maintenance: z.object({
    mutoh_printer_head_cleaned: z.boolean().default(false),
    mutoh_printer_head_rest_cleaned: z.boolean().default(false),
    plotter_adhesive_cleaned: z.boolean().default(false),
  }).default({}),
});

type GraphicsReportFormValues = z.infer<typeof graphicsReportSchema>;

const defaultValues: Partial<GraphicsReportFormValues> = {
  report_date: new Date(),
  personnel: [{ name: "", start_time: "", end_time: "", note: "" }],
  work_entries: [{ tag_id: "", work_category: "Cutting/Masking", work_type: "", description: "" }],
  boxed_shipped: [],
  maintenance: [],
  daily_maintenance: {
    mutoh_printer_head_cleaned: false,
    mutoh_printer_head_rest_cleaned: false,
    plotter_adhesive_cleaned: false,
  }
};

function Section({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="pb-2">
        <h3 className="text-xl font-semibold text-primary">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Card>
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

export function GraphicsReportForm() {
  const { toast } = useToast();
  const form = useForm<GraphicsReportFormValues>({
    resolver: zodResolver(graphicsReportSchema),
    defaultValues,
  });

  const { fields: personnelFields, append: appendPersonnel, remove: removePersonnel } = useFieldArray({ control: form.control, name: "personnel" });
  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({ control: form.control, name: "work_entries" });
  const { fields: boxedFields, append: appendBoxed, remove: removeBoxed } = useFieldArray({ control: form.control, name: "boxed_shipped" });
  const { fields: maintenanceFields, append: appendMaintenance, remove: removeMaintenance } = useFieldArray({ control: form.control, name: "maintenance" });

  function onSubmit(values: GraphicsReportFormValues) {
    console.log(values);
    toast({
      title: "Graphics Report Submitted!",
      description: "Your detailed report has been successfully submitted.",
    });
    form.reset();
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Graphics Entry Form</CardTitle>
                <CardDescription>Enter shift details for the Graphics Department.</CardDescription>
            </CardHeader>
            <CardContent>
                 <FormField control={form.control} name="report_date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
        </Card>
        
        <Section title="Personnel">
          <div className="space-y-4">
            {personnelFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md relative space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name={`personnel.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Employee name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`personnel.${index}.start_time`} render={({ field }) => (<FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`personnel.${index}.end_time`} render={({ field }) => (<FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name={`personnel.${index}.note`} render={({ field }) => (<FormItem><FormLabel>Note (Optional)</FormLabel><FormControl><Input placeholder="Optional note..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removePersonnel(index)}><Trash2 className="size-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendPersonnel({ name: '', start_time: '', end_time: '', note: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Person</Button>
          </div>
        </Section>
        
        <Section title="Work Entries">
          <div className="space-y-4">
            {workFields.map((field, index) => (
                <WorkEntryField key={field.id} index={index} control={form.control} remove={removeWork} />
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendWork({ tag_id: '', work_category: 'Cutting/Masking', work_type: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Work Entry</Button>
          </div>
        </Section>

        <Section title="Boxed / Shipped">
            <div className="space-y-4">
                {boxedFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-4">
                        <FormField control={form.control} name={`boxed_shipped.${index}.name`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Item Name</FormLabel><FormControl><Input placeholder="e.g., Sail #12345" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeBoxed(index)}><Trash2 className="size-4"/></Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendBoxed({ name: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Item</Button>
            </div>
        </Section>

        <Section title="Maintenance">
            <div className="space-y-4">
                {maintenanceFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md relative">
                        <FormField control={form.control} name={`maintenance.${index}.description`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`maintenance.${index}.duration_hrs`} render={({ field }) => (<FormItem><FormLabel>Duration (hrs)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`maintenance.${index}.personnel_count`} render={({ field }) => (<FormItem><FormLabel>Personnel</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeMaintenance(index)}><Trash2 className="size-4"/></Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendMaintenance({ description: '', duration_hrs: 0, personnel_count: 1 })}><PlusCircle className="mr-2 h-4 w-4" />Add Maintenance</Button>
            </div>
        </Section>

        <Section title="Daily Machine Maintenance">
            <div className="space-y-4">
                <FormField control={form.control} name="daily_maintenance.mutoh_printer_head_cleaned" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Mutoh Printer – Head Area Cleaned</FormLabel></FormItem>)} />
                <FormField control={form.control} name="daily_maintenance.mutoh_printer_head_rest_cleaned" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Mutoh Printer – Head Rest Area Cleaned</FormLabel></FormItem>)} />
                <FormField control={form.control} name="daily_maintenance.plotter_adhesive_cleaned" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Plotter – Adhesive Cleaned</FormLabel></FormItem>)} />
            </div>
        </Section>
        

        <Button type="submit" size="lg">Submit Report</Button>
      </form>
    </Form>
  )
}


function WorkEntryField({ index, control, remove }: { index: number, control: any, remove: (index: number) => void }) {
    const category = useWatch({ control, name: `work_entries.${index}.work_category` });
    const workType = useWatch({ control, name: `work_entries.${index}.work_type` });
    
    const showDurationAndPersonnel = category === 'Cutting/Masking' && ['Rolling', 'Masking'].includes(workType);
    
    return (
        <Card className="p-4 relative bg-muted/30">
            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => remove(index)}>
                <Trash2 className="size-4" />
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField control={control} name={`work_entries.${index}.tag_id`} render={({ field }) => (
                    <FormItem><FormLabel>Tag ID</FormLabel><FormControl><Input placeholder="Sail or Job ID" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={control} name={`work_entries.${index}.work_category`} render={({ field }) => (
                    <FormItem><FormLabel>Work Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                {Object.keys(workCategoryOptions).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )}/>
                 <FormField control={control} name={`work_entries.${index}.work_type`} render={({ field }) => (
                    <FormItem><FormLabel>Work Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!category}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a type..."/></SelectTrigger></FormControl>
                            <SelectContent>
                                {(workCategoryOptions[category as WorkCategory] || []).map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )}/>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {showDurationAndPersonnel && (
                    <>
                        <FormField control={control} name={`work_entries.${index}.duration_hrs`} render={({ field }) => (
                            <FormItem><FormLabel>Duration (hrs)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={control} name={`work_entries.${index}.personnel_count`} render={({ field }) => (
                            <FormItem><FormLabel>Personnel Count</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </>
                )}
                 {category === 'Inking' && (
                    <FormField control={control} name={`work_entries.${index}.tape_used`} render={({ field }) => (
                        <FormItem className="flex flex-row items-end space-x-3 space-y-0 h-10">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <FormLabel className="pb-1">Tape Used</FormLabel>
                        </FormItem>
                    )} />
                )}
                 <div className={showDurationAndPersonnel ? 'col-span-1' : 'col-span-3'}>
                    <FormField control={control} name={`work_entries.${index}.description`} render={({ field }) => (
                        <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Input placeholder="Optional task details..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                 </div>
            </div>
        </Card>
    )
}
