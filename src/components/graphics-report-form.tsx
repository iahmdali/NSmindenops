
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import React, { useState } from "react"
import { PlusCircle, Trash2, GripVertical } from "lucide-react"

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
import { DatePicker } from "@/components/ui/date-picker"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "./ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { GraphicsKanbanBoard, type Task } from "./graphics/graphics-kanban-board"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"


const personnelSchema = z.object({
    name: z.string().min(1, "Name is required."),
    start_time: z.string().min(1, "Start time is required."),
    end_time: z.string().min(1, "End time is required."),
    notes: z.string().optional(),
});

const maintenanceTaskSchema = z.object({
    description: z.string().min(1, "Description is required."),
    duration_mins: z.coerce.number().min(0, "Duration must be positive."),
    personnel_count: z.coerce.number().min(1, "Personnel count must be at least 1."),
});


const graphicsReportSchema = z.object({
  report_date: z.date({ required_error: 'A date for the report is required.' }),
  shift: z.string().min(1, "Shift is required."),
  shift_lead_name: z.string().min(1, "Lead name is required."),
  personnel: z.array(personnelSchema).min(1, "At least one person is required."),
  maintenance_tasks: z.array(maintenanceTaskSchema).optional(),
  daily_maintenance: z.object({
    mutoh_head_area: z.boolean().default(false),
    mutoh_head_rest: z.boolean().default(false),
    plotter_adhesive: z.boolean().default(false),
    vacuum_table_cleaned: z.boolean().default(false),
    air_filters_checked: z.boolean().default(false),
  }).default({}),
});

type GraphicsReportFormValues = z.infer<typeof graphicsReportSchema>;

const initialTasks: Task[] = [
    { id: 'cut-1', type: 'cutting', tagId: 'SAIL-123', status: 'todo', content: 'Initial cutting task' },
    { id: 'ink-1', type: 'inking', tagId: 'DECAL-456', status: 'inProgress', content: 'Inking main logo' },
    { id: 'cut-2', type: 'cutting', tagId: 'SAIL-789', status: 'done', content: 'Final weeding' },
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
  )
}

export function GraphicsReportForm() {
    const { toast } = useToast();
    const [cuttingTasks, setCuttingTasks] = useState<Task[]>(initialTasks.filter(t => t.type === 'cutting'));
    const [inkingTasks, setInkingTasks] = useState<Task[]>(initialTasks.filter(t => t.type === 'inking'));
    
    const form = useForm<GraphicsReportFormValues>({
        resolver: zodResolver(graphicsReportSchema),
        defaultValues: {
            report_date: new Date(),
            shift: "1",
            shift_lead_name: "",
            personnel: [],
            maintenance_tasks: [],
            daily_maintenance: {
                mutoh_head_area: false,
                mutoh_head_rest: false,
                plotter_adhesive: false,
                vacuum_table_cleaned: false,
                air_filters_checked: false,
            }
        },
        mode: "onBlur"
    });

    const { fields: personnelFields, append: appendPersonnel, remove: removePersonnel } = useFieldArray({ control: form.control, name: "personnel" });
    const { fields: maintenanceFields, append: appendMaintenance, remove: removeMaintenance } = useFieldArray({ control: form.control, name: "maintenance_tasks" });
    
    function onSubmit(values: GraphicsReportFormValues) {
        const fullReport = {
            ...values,
            tasks: {
                cutting: cuttingTasks,
                inking: inkingTasks,
            }
        };
        console.log(fullReport);
        toast({
            title: "Graphics Report Submitted!",
            description: "Your detailed Kanban-based report has been successfully submitted.",
        });
        // form.reset(); // Optionally reset metadata form
        // setCuttingTasks([]); // Reset tasks
        // setInkingTasks([]);
    }
    
    function handleSaveDraft(values: GraphicsReportFormValues) {
        const draft = {
            ...values,
            tasks: {
                cutting: cuttingTasks,
                inking: inkingTasks,
            }
        };
        console.log("Saving draft:", draft);
        toast({
            title: "Draft Saved!",
            description: "Your report draft has been saved.",
        });
    }

    const addNewTask = (type: 'cutting' | 'inking') => {
        const newTask: Task = {
            id: `${type}-${Date.now()}`,
            type,
            tagId: '',
            status: 'todo',
            content: 'New Task'
        };
        if (type === 'cutting') {
            setCuttingTasks(prev => [...prev, newTask]);
        } else {
            setInkingTasks(prev => [...prev, newTask]);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Graphics Shift Report</CardTitle>
                        <CardDescription>Manage tasks using the Kanban boards below. Log personnel and maintenance in their sections.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="report_date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="shift" render={({ field }) => (<FormItem><FormLabel>Shift</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">Shift 1</SelectItem><SelectItem value="2">Shift 2</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="shift_lead_name" render={({ field }) => (<FormItem><FormLabel>Shift Lead</FormLabel><FormControl><Input placeholder="Lead's name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>

                <Tabs defaultValue="cutting">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="cutting">Cutting/Masking Tasks</TabsTrigger>
                        <TabsTrigger value="inking">Inking Tasks</TabsTrigger>
                    </TabsList>
                    <TabsContent value="cutting">
                        <GraphicsKanbanBoard tasks={cuttingTasks} setTasks={setCuttingTasks} type="cutting" onAddTask={() => addNewTask('cutting')} />
                    </TabsContent>
                    <TabsContent value="inking">
                        <GraphicsKanbanBoard tasks={inkingTasks} setTasks={setInkingTasks} type="inking" onAddTask={() => addNewTask('inking')} />
                    </TabsContent>
                </Tabs>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Log Personnel</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl">
                            <DialogHeader><DialogTitle>Personnel Log</DialogTitle></DialogHeader>
                            <div className="max-h-[60vh] overflow-y-auto p-1">
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
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                         <DialogTrigger asChild>
                            <Button variant="outline">Log Maintenance</Button>
                        </DialogTrigger>
                         <DialogContent className="sm:max-w-4xl">
                            <DialogHeader><DialogTitle>Maintenance Log</DialogTitle></DialogHeader>
                             <div className="max-h-[60vh] overflow-y-auto p-1 space-y-4">
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
                                         <FormField control={form.control} name="daily_maintenance.air_filters_checked" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Air Filters Checked</FormLabel></FormItem>)} />
                                    </div>
                                </Section>
                             </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={form.handleSubmit(handleSaveDraft)}>Save Draft</Button>
                    <Button type="submit" size="lg">Submit Report</Button>
                </div>
            </form>
        </Form>
    )
}
