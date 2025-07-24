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
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"

const cuttingWorkTypes = ["Cutting", "Masking", "Weeding", "Rolling", "Printing"];
const inkingWorkTypes = ["Layout", "Masking", "Fold", "Mixing Ink", "Touch-up"];

const taskSchema = z.object({
  tag_id: z.string().min(1, "Tag ID is required."),
  tag_type: z.enum(["Sail", "Decal"], { required_error: "Tag type is required."}),
  sidedness: z.enum(["Single-Sided", "Double-Sided"]).optional(),
  side_of_work: z.enum(["Front", "Back"]).optional(),
  duration_mins: z.coerce.number().min(0, "Duration must be positive."),
  personnel_count: z.coerce.number().min(1, "At least one person is required."),
  description: z.string().optional(),
});

const cuttingTaskSchema = taskSchema.extend({
    work_types: z.array(z.string()).refine(value => value.some(item => item), {
        message: "You have to select at least one work type.",
    }),
});

const inkingTaskSchema = taskSchema.extend({
    work_types: z.array(z.string()).refine(value => value.some(item => item), {
        message: "You have to select at least one work type.",
    }),
    tape_used: z.boolean().default(false),
    is_finished: z.boolean().default(false),
});


const graphicsReportSchema = z.object({
  report_date: z.date({ required_error: 'A date for the report is required.' }),
  shift: z.string().min(1, "Shift is required."),
  shift_lead_name: z.string().min(1, "Lead name is required."),
  personnel: z.array(z.object({
    name: z.string().min(1, "Name is required."),
    start_time: z.string().min(1, "Start time is required."),
    end_time: z.string().min(1, "End time is required."),
    notes: z.string().optional(),
  })).min(1, "At least one person is required."),
  cutting_tasks: z.array(cuttingTaskSchema).optional(),
  inking_tasks: z.array(inkingTaskSchema).optional(),
  items_shipped: z.array(z.object({ tag_id: z.string().min(1, "Tag ID required.")})).optional(),
  maintenance_tasks: z.array(z.object({
    description: z.string().min(1, "Description is required."),
    duration_mins: z.coerce.number().min(0, "Duration must be positive."),
    personnel_count: z.coerce.number().min(1, "Personnel count must be at least 1."),
  })).optional(),
  daily_maintenance: z.object({
    mutoh_head_area: z.boolean().default(false),
    mutoh_head_rest: z.boolean().default(false),
    plotter_adhesive: z.boolean().default(false),
    vacuum_table_cleaned: z.boolean().default(false),
  }).default({}),
}).refine(data => {
    return (data.cutting_tasks && data.cutting_tasks.length > 0) || (data.inking_tasks && data.inking_tasks.length > 0)
}, {
    message: "At least one Cutting/Masking or Inking task is required.",
    path: ["cutting_tasks"],
});

type GraphicsReportFormValues = z.infer<typeof graphicsReportSchema>;

const defaultValues: Partial<GraphicsReportFormValues> = {
    report_date: new Date(),
    shift: "1",
    shift_lead_name: "",
    personnel: [],
    cutting_tasks: [],
    inking_tasks: [],
    items_shipped: [],
    maintenance_tasks: [],
    daily_maintenance: {
        mutoh_head_area: false,
        mutoh_head_rest: false,
        plotter_adhesive: false,
        vacuum_table_cleaned: false,
    }
};

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
  )
}

export function GraphicsReportForm() {
  const { toast } = useToast();
  const form = useForm<GraphicsReportFormValues>({
    resolver: zodResolver(graphicsReportSchema),
    defaultValues,
    mode: "onBlur"
  });

  const { fields: personnelFields, append: appendPersonnel, remove: removePersonnel } = useFieldArray({ control: form.control, name: "personnel" });
  const { fields: cuttingFields, append: appendCutting, remove: removeCutting } = useFieldArray({ control: form.control, name: "cutting_tasks" });
  const { fields: inkingFields, append: appendInking, remove: removeInking } = useFieldArray({ control: form.control, name: "inking_tasks" });
  const { fields: shippedFields, append: appendShipped, remove: removeShipped } = useFieldArray({ control: form.control, name: "items_shipped" });
  const { fields: maintenanceFields, append: appendMaintenance, remove: removeMaintenance } = useFieldArray({ control: form.control, name: "maintenance_tasks" });

  function onSubmit(values: GraphicsReportFormValues) {
    console.log(values);
    toast({
      title: "Graphics Report Submitted!",
      description: "Your detailed report has been successfully submitted.",
    });
    form.reset();
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
                <CardTitle className="font-headline">Graphics Shift Report</CardTitle>
                <CardDescription>Enter daily report details for the Graphics Department.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
                 <FormField control={form.control} name="report_date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="shift" render={({ field }) => (<FormItem><FormLabel>Shift</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">Shift 1</SelectItem><SelectItem value="2">Shift 2</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="shift_lead_name" render={({ field }) => (<FormItem><FormLabel>Shift Lead</FormLabel><FormControl><Input placeholder="Lead's name" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
        </Card>
        
        <Section title="Personnel" actions={<Button type="button" variant="outline" size="sm" onClick={() => appendPersonnel({ name: '', start_time: '', end_time: '', notes: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Person</Button>}>
          <div className="space-y-4">
            {personnelFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md relative grid md:grid-cols-4 gap-4 items-end">
                <FormField control={form.control} name={`personnel.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Employee name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`personnel.${index}.start_time`} render={({ field }) => (<FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`personnel.${index}.end_time`} render={({ field }) => (<FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`personnel.${index}.notes`} render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Input placeholder="Optional" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removePersonnel(index)}><Trash2 className="size-4" /></Button>
              </div>
            ))}
            {personnelFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No personnel added.</p>}
          </div>
        </Section>
        
        <Section title="Cutting/Masking Tasks" actions={<Button type="button" variant="outline" size="sm" onClick={() => appendCutting({ tag_id: '', tag_type: 'Sail', work_types: [], duration_mins: 0, personnel_count: 1  })}><PlusCircle className="mr-2 h-4 w-4" />Add Task</Button>}>
            <div className="space-y-4">
                {cuttingFields.map((field, index) => <TaskCard key={field.id} control={form.control} section="cutting_tasks" index={index} onRemove={removeCutting} workTypes={cuttingWorkTypes} />)}
                {cuttingFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No cutting/masking tasks added.</p>}
            </div>
        </Section>
        
        <Section title="Inking Tasks" actions={<Button type="button" variant="outline" size="sm" onClick={() => appendInking({ tag_id: '', tag_type: 'Sail', work_types: [], duration_mins: 0, personnel_count: 1, tape_used: false, is_finished: false  })}><PlusCircle className="mr-2 h-4 w-4" />Add Task</Button>}>
            <div className="space-y-4">
                {inkingFields.map((field, index) => <TaskCard key={field.id} control={form.control} section="inking_tasks" index={index} onRemove={removeInking} workTypes={inkingWorkTypes} />)}
                {inkingFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No inking tasks added.</p>}
            </div>
        </Section>

        <Section title="Items Shipped" actions={<Button type="button" variant="outline" size="sm" onClick={() => appendShipped({ tag_id: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add Item</Button>}>
            <div className="space-y-4">
                {shippedFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-4">
                        <FormField control={form.control} name={`items_shipped.${index}.tag_id`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Tag ID</FormLabel><FormControl><Input placeholder="e.g., Sail #12345 or Decal ID" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeShipped(index)}><Trash2 className="size-4"/></Button>
                    </div>
                ))}
                {shippedFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No shipped items added.</p>}
            </div>
        </Section>
        
        <Section title="Maintenance Tasks" actions={<Button type="button" variant="outline" size="sm" onClick={() => appendMaintenance({ description: '', duration_mins: 0, personnel_count: 1 })}><PlusCircle className="mr-2 h-4 w-4" />Add Maintenance</Button>}>
            <div className="space-y-4">
                {maintenanceFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md relative">
                        <FormField control={form.control} name={`maintenance_tasks.${index}.description`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`maintenance_tasks.${index}.duration_mins`} render={({ field }) => (<FormItem><FormLabel>Duration (mins)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`maintenance_tasks.${index}.personnel_count`} render={({ field }) => (<FormItem><FormLabel>Personnel</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeMaintenance(index)}><Trash2 className="size-4"/></Button>
                    </div>
                ))}
                {maintenanceFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No maintenance tasks added.</p>}
            </div>
        </Section>

        <Section title="Daily Machine Maintenance Checks">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                <FormField control={form.control} name="daily_maintenance.mutoh_head_area" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Mutoh – Head Area</FormLabel></FormItem>)} />
                <FormField control={form.control} name="daily_maintenance.mutoh_head_rest" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Mutoh – Head Rest</FormLabel></FormItem>)} />
                <FormField control={form.control} name="daily_maintenance.plotter_adhesive" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Plotter – Adhesive</FormLabel></FormItem>)} />
                <FormField control={form.control} name="daily_maintenance.vacuum_table_cleaned" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Vacuum/Table Cleaned</FormLabel></FormItem>)} />
            </div>
        </Section>
        
        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
            <Button type="submit" size="lg">Submit Report</Button>
        </div>
      </form>
    </Form>
  )
}

function TaskCard({ control, section, index, onRemove, workTypes }: { control: any, section: "cutting_tasks" | "inking_tasks", index: number, onRemove: (index: number) => void, workTypes: readonly string[] }) {
    const tagType = useWatch({ control, name: `${section}.${index}.tag_type` });
    const sidedness = useWatch({ control, name: `${section}.${index}.sidedness` });

    const isSail = tagType === 'Sail';
    const isDoubleSided = isSail && sidedness === 'Double-Sided';

    return (
         <Card className="p-4 relative bg-muted/20">
            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => onRemove(index)}><Trash2 className="size-4" /></Button>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
                <FormField control={control} name={`${section}.${index}.tag_id`} render={({ field }) => (<FormItem><FormLabel>Tag ID</FormLabel><FormControl><Input placeholder="Sail or Decal ID" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Controller control={control} name={`${section}.${index}.tag_type`} render={({ field }) => (
                    <FormItem><FormLabel>Tag Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 h-10"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Sail" /></FormControl><FormLabel className="font-normal">Sail</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Decal" /></FormControl><FormLabel className="font-normal">Decal</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
                )} />
                {isSail && (
                     <Controller control={control} name={`${section}.${index}.sidedness`} render={({ field }) => (
                        <FormItem><FormLabel>Sidedness</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 h-10"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Single-Sided" /></FormControl><FormLabel className="font-normal">Single-Sided</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Double-Sided" /></FormControl><FormLabel className="font-normal">Double-Sided</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>
                    )} />
                )}
                 {isDoubleSided && (
                    <FormField control={control} name={`${section}.${index}.side_of_work`} render={({ field }) => (
                        <FormItem><FormLabel>Side of Work</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Front">Front</SelectItem><SelectItem value="Back">Back</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )} />
                )}
            </div>

            <Separator className="my-4"/>

            <div className="mb-4">
                 <FormField
                    control={control}
                    name={`${section}.${index}.work_types`}
                    render={() => (
                        <FormItem>
                            <FormLabel>Work Type(s)</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {workTypes.map((item) => (
                                <FormField
                                    key={item}
                                    control={control}
                                    name={`${section}.${index}.work_types`}
                                    render={({ field }) => {
                                    return (
                                        <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                        ? field.onChange([...(field.value || []), item])
                                                        : field.onChange(field.value?.filter((value) => value !== item))
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">{item}</FormLabel>
                                        </FormItem>
                                    )
                                    }}
                                />
                                ))}
                            </div>
                             <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
            
             <div className="grid md:grid-cols-4 gap-4 items-end">
                <FormField control={control} name={`${section}.${index}.duration_mins`} render={({ field }) => (<FormItem><FormLabel>Duration (mins)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={control} name={`${section}.${index}.personnel_count`} render={({ field }) => (<FormItem><FormLabel>Personnel</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={control} name={`${section}.${index}.description`} render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Description</FormLabel><FormControl><Input placeholder="Optional notes" {...field} /></FormControl><FormMessage /></FormItem>)}/>
             </div>

             {section === 'inking_tasks' && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <FormField control={control} name={`${section}.${index}.tape_used`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Tape Used?</FormLabel></FormItem>)} />
                    <FormField control={control} name={`${section}.${index}.is_finished`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 bg-background"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Mark as Finished</FormLabel></div></FormItem>)} />
                </div>
             )}
        </Card>
    )
}
