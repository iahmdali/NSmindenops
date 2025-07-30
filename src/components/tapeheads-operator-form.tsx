
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import * as z from "zod"
import { PlusCircle, Trash2 } from "lucide-react"
import React from "react";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command"
import { cn } from "@/lib/utils"

const tapeheadsOperatorSchema = z.object({
  date: z.date(),
  shift: z.string().min(1, "Shift is required."),
  shift_lead_name: z.string().min(1, "Shift lead name is required."),
  th_number: z.string().min(1, "TH Number is required."),
  operator_name: z.string().min(1, "Operator name is required."),
  material_type: z.string().min(1, "Material type is required."),
  end_of_shift_status: z.string().min(1, "End of shift status is required."),
  order_entry: z.string().optional(),
  layer: z.string().optional(),
  shift_start_time: z.string().min(1, "Start time is required."),
  shift_end_time: z.string().min(1, "End time is required."),
  total_meters: z.coerce.number().min(0),
  total_tapes: z.coerce.number().min(0),
  issues: z.array(z.object({
    title: z.string().min(1, "Title is required."),
    duration_minutes: z.coerce.number().optional(),
  })).optional(),
  had_spin_out: z.boolean().default(false),
  spin_out_duration_minutes: z.coerce.number().optional(),
  panels_worked_on: z.array(z.string()).optional(),
  nested_panels: z.array(z.object({ value: z.string() })).optional(),
  checklist_items: z.object({
    smooth_fuse_full: z.boolean().default(false),
    blades_glasses: z.boolean().default(false),
    paperwork_up_to_date: z.boolean().default(false),
    debrief_new_operator: z.boolean().default(false),
    electric_scissor: z.boolean().default(false),
    tubes_at_end_of_table: z.boolean().default(false),
    spray_tracks_on_bridge: z.boolean().default(false),
    sharpie_pens: z.boolean().default(false),
    broom: z.boolean().default(false),
    cleaned_work_station: z.boolean().default(false),
    meter_stick: z.boolean().default(false),
    two_irons: z.boolean().default(false),
    th_isle_trash_empty: z.boolean().default(false),
  }).default({}),
});

type TapeheadsOperatorFormValues = z.infer<typeof tapeheadsOperatorSchema>;

function SectionHeader({ title, description }: { title: string, description?: string }) {
  return (
    <div className="py-4">
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

const panelOptions = [...Array(10)].map((_, i) => ({ value: `P${i+1}`, label: `P${i+1}` }));

export function TapeheadsOperatorForm() {
  const { toast } = useToast();
  const form = useForm<TapeheadsOperatorFormValues>({
    resolver: zodResolver(tapeheadsOperatorSchema),
    defaultValues: {
      date: new Date(),
      shift: "1",
      shift_lead_name: "",
      th_number: "TH-1",
      operator_name: "",
      material_type: "Carbon",
      end_of_shift_status: "Completed",
      shift_start_time: '',
      shift_end_time: '',
      total_meters: 0,
      total_tapes: 0,
      issues: [],
      had_spin_out: false,
      spin_out_duration_minutes: 0,
      panels_worked_on: [],
      nested_panels: [],
      checklist_items: {},
    },
  });

  const { fields: issueFields, append: appendIssue, remove: removeIssue } = useFieldArray({ control: form.control, name: "issues" });
  const { fields: nestedPanelFields, append: appendNested, remove: removeNested } = useFieldArray({ control: form.control, name: "nested_panels" });
  
  const status = useWatch({ control: form.control, name: 'end_of_shift_status' });
  const hadSpinOut = useWatch({ control: form.control, name: 'had_spin_out' });
  const startTimeStr = useWatch({ control: form.control, name: 'shift_start_time' });
  const endTimeStr = useWatch({ control: form.control, name: 'shift_end_time' });
  const totalMeters = useWatch({ control: form.control, name: 'total_meters' });

  const hoursWorked = React.useMemo(() => {
    if (!startTimeStr || !endTimeStr) return 0;
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);
    const startDate = new Date(0,0,0,startH, startM);
    let endDate = new Date(0,0,0,endH, endM);
    if(endDate < startDate) { // Handles overnight shifts
      endDate.setDate(endDate.getDate() + 1);
    }
    const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    return parseFloat(diff.toFixed(2));
  }, [startTimeStr, endTimeStr]);
  
  const metersPerHour = React.useMemo(() => {
    if(!hoursWorked || !totalMeters) return 0;
    return parseFloat((totalMeters / hoursWorked).toFixed(2));
  }, [hoursWorked, totalMeters]);


  function handleFormSubmit(values: TapeheadsOperatorFormValues) {
    console.log(values);
    toast({
      title: `Report Submitted!`,
      description: `Your Tapeheads report has been successfully saved.`,
    });
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Tapeheads Operator Entry Form</CardTitle>
        <CardDescription>Fill out your individual entry for the shift and OE section.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            <SectionHeader title="Shift Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="shift" render={({ field }) => (<FormItem><FormLabel>Shift</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="1">Shift 1</SelectItem><SelectItem value="2">Shift 2</SelectItem><SelectItem value="3">Shift 3</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="shift_lead_name" render={({ field }) => (<FormItem><FormLabel>Shift Lead Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="th_number" render={({ field }) => (<FormItem><FormLabel>TH Number</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{[...Array(10)].map((_, i) => (<SelectItem key={i} value={`TH-${i+1}`}>{`TH-${i+1}`}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="operator_name" render={({ field }) => (<FormItem><FormLabel>Operator Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
            </div>

            <Separator />
            <SectionHeader title="Work & Output" />
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FormField control={form.control} name="material_type" render={({ field }) => (<FormItem><FormLabel>Material Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Carbon">Carbon</SelectItem><SelectItem value="Aramid">Aramid</SelectItem><SelectItem value="Kevlar">Kevlar</SelectItem><SelectItem value="Polyester">Polyester</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="total_meters" render={({ field }) => (<FormItem><FormLabel>Meters Produced</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="total_tapes" render={({ field }) => (<FormItem><FormLabel>Tapes Used</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-end">
                <FormField control={form.control} name="end_of_shift_status" render={({ field }) => (<FormItem><FormLabel>End of Shift Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                {status === 'In Progress' && (
                  <>
                    <FormField control={form.control} name="order_entry" render={({ field }) => (<FormItem><FormLabel>OE Output Estimate</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="layer" render={({ field }) => (<FormItem><FormLabel>Layer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  </>
                )}
            </div>

            <Separator />
            <SectionHeader title="Time & Productivity" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FormField control={form.control} name="shift_start_time" render={({ field }) => (<FormItem><FormLabel>Shift Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="shift_end_time" render={({ field }) => (<FormItem><FormLabel>Shift End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormItem>
                <FormLabel>Hours Worked</FormLabel>
                <Input value={hoursWorked} readOnly className="font-mono bg-muted"/>
              </FormItem>
              <FormItem>
                <FormLabel>Meters / Man Hour</FormLabel>
                <Input value={metersPerHour} readOnly className="font-mono bg-muted"/>
              </FormItem>
            </div>
            
            <Separator />
            <SectionHeader title="Issues & Downtime" description="Record any problems that caused delays."/>
            <div className="space-y-4">
              <FormField control={form.control} name="had_spin_out" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal text-base">Had Spin Out?</FormLabel></FormItem>)} />
              {hadSpinOut && (
                  <FormField control={form.control} name="spin_out_duration_minutes" render={({ field }) => (<FormItem className="max-w-xs"><FormLabel>Spin Out Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              )}
              {issueFields.map((field, index) => (
                <Card key={field.id} className="p-4 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                     <FormField control={form.control} name={`issues.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Problem Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                     <FormField control={form.control} name={`issues.${index}.duration_minutes`} render={({ field }) => ( <FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeIssue(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                </Card>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendIssue({ title: '', duration_minutes: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Problem
              </Button>
            </div>

            <Separator />
            <SectionHeader title="Panel Tracking" />
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="panels_worked_on"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Panels Worked On</FormLabel>
                            <FormControl>
                               <MultiSelect options={panelOptions} selected={field.value || []} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div>
                  <FormLabel>Nested Panels</FormLabel>
                  <div className="space-y-2 pt-2">
                    {nestedPanelFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`nested_panels.${index}.value`}
                          render={({ field }) => (
                            <Input {...field} placeholder="e.g., P1a" className="flex-1"/>
                          )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeNested(index)}><Trash2 className="size-4 text-destructive"/></Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendNested({ value: '' })}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Nested Panel
                    </Button>
                  </div>
                </div>
            </div>
            
            <Separator />
            <SectionHeader title="End of Shift Checklist"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <FormField control={form.control} name="checklist_items.smooth_fuse_full" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Smooth Fuse Full</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.blades_glasses" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Blades Glasses</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.paperwork_up_to_date" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Paperwork Up To Date</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.debrief_new_operator" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Debrief New Operator</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.electric_scissor" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Electric Scissor</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.tubes_at_end_of_table" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Tubes At End Of Table</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.spray_tracks_on_bridge" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Spray Tracks On Bridge</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.sharpie_pens" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Sharpie Pens</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.broom" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Broom</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.cleaned_work_station" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Cleaned Work Station</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.meter_stick" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Meter Stick</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.two_irons" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Two Irons</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.th_isle_trash_empty" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">TH Isle Trash Empty</FormLabel></FormItem>)} />
            </div>

            <div className="flex justify-end gap-2 pt-8">
              <Button type="submit">Submit Report</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// A simple multi-select component
function MultiSelect({ options, selected, onChange }: { options: {value: string, label: string}[], selected: string[], onChange: (selected: string[]) => void }) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {selected.length > 0 ? selected.join(", ") : "Select panels..."}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search panels..." />
          <CommandEmpty>No panel found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(currentValue) => {
                  handleSelect(currentValue);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(option.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
