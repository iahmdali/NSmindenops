
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form"
import * as z from "zod"
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
import { PlusCircle, Trash2 } from "lucide-react"
import { Checkbox } from "./ui/checkbox"
import { Separator } from "./ui/separator"
import React, { useEffect } from "react"
import { MultiSelect } from "./ui/multi-select"
import { updateOeSectionStatus, type OeSection } from "@/lib/oe-data"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"

const problemSchema = z.object({
  title: z.string().min(1, "Problem title is required."),
  duration: z.coerce.number().optional(),
});

const tapeheadsOperatorSchema = z.object({
  date: z.date(),
  shift: z.string().min(1),
  shiftLeadName: z.string().min(1, "Shift lead name is required."),
  oeNumber: z.string(),
  section: z.string(),

  // Operator Entry
  thNumber: z.string().min(1, "TH Number is required."),
  operatorName: z.string().min(1, "Operator name is required."),
  materialType: z.string().min(1, "Material type is required."),
  endOfShiftStatus: z.string().min(1, "Status is required."),
  
  // Conditional fields for "In Progress"
  oeOutputEstimate: z.coerce.number().optional(),
  layer: z.string().optional(),

  // Time and Output
  shiftStartTime: z.string().min(1, "Start time is required."),
  shiftEndTime: z.string().min(1, "End time is required."),
  hoursWorked: z.coerce.number().optional(),
  metersProduced: z.coerce.number().min(0),
  tapesUsed: z.coerce.number().min(0),
  metersPerManHour: z.coerce.number().optional(),

  // Spin out and Problems
  hadSpinOut: z.boolean().default(false),
  spinOutDuration: z.coerce.number().optional(),
  problems: z.array(problemSchema).optional(),
  
  // Panel Tracking
  panelWorkType: z.enum(["individual", "nested"]).default("individual"),
  panelsWorkedOn: z.array(z.string()).min(1, "At least one panel must be selected."),

  // Checklist
  checklist: z.object({
    smoothFuseFull: z.boolean().default(false),
    bladesGlasses: z.boolean().default(false),
    paperworkUpToDate: z.boolean().default(false),
    debriefNewOperator: z.boolean().default(false),
    electricScissor: z.boolean().default(false),
    tubesAtEndOfTable: z.boolean().default(false),
    sprayTracksOnBridge: z.boolean().default(false),
    sharpiePens: z.boolean().default(false),
    broom: z.boolean().default(false),
    cleanedWorkStation: z.boolean().default(false),
    meterStickTwoIrons: z.boolean().default(false),
    thIsleTrashEmpty: z.boolean().default(false),
  })
});

type OperatorFormValues = z.infer<typeof tapeheadsOperatorSchema>;

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      {children}
      <Separator />
    </div>
  )
}

const checklistItems = [
    { id: 'smoothFuseFull', label: 'Smooth Fuse Full' },
    { id: 'bladesGlasses', label: 'Blades Glasses' },
    { id: 'paperworkUpToDate', label: 'Paperwork Up to Date' },
    { id: 'debriefNewOperator', label: 'Debrief New Operator' },
    { id: 'electricScissor', label: 'Electric Scissor' },
    { id: 'tubesAtEndOfTable', label: 'Tubes at End of Table' },
    { id: 'sprayTracksOnBridge', label: 'Spray Tracks on Bridge' },
    { id: 'sharpiePens', label: 'Sharpie Pens' },
    { id: 'broom', label: 'Broom' },
    { id: 'cleanedWorkStation', label: 'Cleaned Work Station' },
    { id: 'meterStickTwoIrons', label: 'Meter Stick / Two Irons' },
    { id: 'thIsleTrashEmpty', label: 'TH Isle Trash Empty' },
] as const;


export function TapeheadsOperatorForm({ oeSection }: { oeSection: OeSection }) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<OperatorFormValues>({
    resolver: zodResolver(tapeheadsOperatorSchema),
    defaultValues: {
      date: new Date(),
      shift: "1",
      shiftLeadName: "",
      oeNumber: oeSection.oeBase,
      section: oeSection.sectionId,
      thNumber: "",
      operatorName: "",
      materialType: "",
      endOfShiftStatus: "Completed",
      metersProduced: 0,
      tapesUsed: 0,
      problems: [],
      panelWorkType: "individual",
      panelsWorkedOn: [],
      checklist: checklistItems.reduce((acc, item) => ({...acc, [item.id]: false}), {})
    },
  });

  const { fields: problemFields, append: appendProblem, remove: removeProblem } = useFieldArray({ control: form.control, name: "problems" });

  const watchStatus = useWatch({ control: form.control, name: "endOfShiftStatus" });
  const watchHadSpinout = useWatch({ control: form.control, name: "hadSpinOut" });
  const watchStartTime = useWatch({ control: form.control, name: "shiftStartTime" });
  const watchEndTime = useWatch({ control: form.control, name: "shiftEndTime" });
  const watchMetersProduced = useWatch({ control: form.control, name: "metersProduced" });
  const watchPanelWorkType = useWatch({ control: form.control, name: "panelWorkType"});
  
  useEffect(() => {
    if (watchStartTime && watchEndTime) {
      const start = new Date(`1970-01-01T${watchStartTime}:00`);
      let end = new Date(`1970-01-01T${watchEndTime}:00`);
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }
      const diffMs = end.getTime() - start.getTime();
      const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(1));
      form.setValue("hoursWorked", hours);

      if (hours > 0 && watchMetersProduced > 0) {
        form.setValue("metersPerManHour", parseFloat((watchMetersProduced / hours).toFixed(1)));
      } else {
        form.setValue("metersPerManHour", 0);
      }
    }
  }, [watchStartTime, watchEndTime, watchMetersProduced, form]);
  
   useEffect(() => {
    // Reset panelsWorkedOn when work type changes
    form.setValue("panelsWorkedOn", []);
  }, [watchPanelWorkType, form]);


  function onSubmit(values: OperatorFormValues) {
    console.log(values);
    updateOeSectionStatus(oeSection.id, 'in-progress');
    toast({
      title: "Operator Work Submitted!",
      description: `Your entry for ${values.oeNumber}-${values.section} has been recorded.`,
    });
    router.push('/report/tapeheads');
  }
  
  const panelOptions = Array.from({ length: oeSection.panels }, (_, i) => ({ value: `P${i + 1}`, label: `P${i + 1}` }));


  return (
    <Card>
      <CardHeader>
        <CardTitle>Operator Work Entry</CardTitle>
        <CardDescription>Log your detailed work for this OE section.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Section title="Shift Details">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="shift" render={({ field }) => (<FormItem><FormLabel>Shift</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="1">Shift 1</SelectItem><SelectItem value="2">Shift 2</SelectItem><SelectItem value="3">Shift 3</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="shiftLeadName" render={({ field }) => (<FormItem><FormLabel>Shift Lead Name</FormLabel><FormControl><Input placeholder="Lead's name" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </Section>

            <Section title="Operator Entry">
                <div className="p-4 border rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField control={form.control} name="thNumber" render={({ field }) => (<FormItem><FormLabel>TH Number</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select TH..." /></SelectTrigger></FormControl><SelectContent>{[...Array(10)].map((_,i) => <SelectItem key={i} value={`TH-${i+1}`}>TH-{i+1}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="operatorName" render={({ field }) => (<FormItem><FormLabel>Operator Name</FormLabel><FormControl><Input placeholder="Your name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="materialType" render={({ field }) => (<FormItem><FormLabel>Material Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select material..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Kevlar">Kevlar</SelectItem><SelectItem value="Polyester">Polyester</SelectItem><SelectItem value="Carbon">Carbon</SelectItem><SelectItem value="Aramid">Aramid</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="endOfShiftStatus" render={({ field }) => (<FormItem><FormLabel>End of Shift Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Completed">Completed</SelectItem><SelectItem value="In Progress">In Progress</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    {watchStatus === "In Progress" && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <FormField control={form.control} name="oeOutputEstimate" render={({ field }) => (<FormItem><FormLabel>OE Output Estimate</FormLabel><FormControl><Input type="number" placeholder="e.g., 500" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="layer" render={({ field }) => (<FormItem><FormLabel>Layer</FormLabel><FormControl><Input placeholder="e.g., 5 of 12" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    )}
                </div>
            </Section>

            <Section title="Time and Output Tracking">
                 <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <FormField control={form.control} name="shiftStartTime" render={({ field }) => (<FormItem><FormLabel>Shift Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="shiftEndTime" render={({ field }) => (<FormItem><FormLabel>Shift End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="hoursWorked" render={({ field }) => (<FormItem><FormLabel>Hours Worked</FormLabel><FormControl><Input type="number" {...field} readOnly className="bg-muted/70" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="metersProduced" render={({ field }) => (<FormItem><FormLabel>Meters Produced</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="tapesUsed" render={({ field }) => (<FormItem><FormLabel>Tapes Used</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 </div>
                  <div className="w-full md:w-1/5">
                     <FormField control={form.control} name="metersPerManHour" render={({ field }) => (<FormItem><FormLabel>Meters/Man-Hour</FormLabel><FormControl><Input type="number" {...field} readOnly className="bg-muted/70" /></FormControl><FormMessage /></FormItem>)} />
                 </div>
            </Section>

            <Section title="Issues">
                <div className="space-y-4">
                    <FormField control={form.control} name="hadSpinOut" render={({ field }) => (<FormItem className="flex items-center gap-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Had Spin Out?</FormLabel></FormItem>)} />
                    {watchHadSpinout && (
                        <FormField control={form.control} name="spinOutDuration" render={({ field }) => (<FormItem className="max-w-xs"><FormLabel>Spin Out Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    )}

                    <h4 className="font-medium pt-2">Problems</h4>
                    {problemFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md">
                            <FormField control={form.control} name={`problems.${index}.title`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Problem Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name={`problems.${index}.duration`} render={({ field }) => (<FormItem><FormLabel>Duration (min)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeProblem(index)}><Trash2 className="size-4" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendProblem({ title: '', duration: 0 })}><PlusCircle className="mr-2 h-4 w-4"/>Add Problem</Button>
                </div>
            </Section>

            <Section title="Panel & Layer Details">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <FormField
                        control={form.control}
                        name="panelWorkType"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Work Type</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center space-x-4"
                                    >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl><RadioGroupItem value="individual" /></FormControl>
                                        <FormLabel className="font-normal">Individual</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl><RadioGroupItem value="nested" /></FormControl>
                                        <FormLabel className="font-normal">Nested</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                      <FormField
                        control={form.control}
                        name="panelsWorkedOn"
                        render={({ field }) => {
                           const handleIndividualChange = (value: string) => {
                                field.onChange(value ? [value] : []);
                            };

                            return (
                                <FormItem>
                                    <FormLabel>Panels Worked On</FormLabel>
                                    {watchPanelWorkType === 'nested' ? (
                                        <MultiSelect
                                            options={panelOptions}
                                            selected={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select panels..."
                                        />
                                    ) : (
                                        <Select onValueChange={handleIndividualChange} value={field.value?.[0] || ""}>
                                             <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a panel" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {panelOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />
                </div>
            </Section>
            
            <Section title="End-of-Shift Checklist">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {checklistItems.map(item => (
                         <FormField key={item.id} control={form.control} name={`checklist.${item.id}`} render={({ field }) => (
                            <FormItem className="flex items-center gap-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>{item.label}</FormLabel></FormItem>
                         )}/>
                    ))}
                </div>
            </Section>

            <div className="flex justify-end">
                <Button type="submit" size="lg">Submit Operator Entry</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

    