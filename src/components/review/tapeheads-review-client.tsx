"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { MoreHorizontal, CheckCircle, AlertCircle, Clock, PlusCircle, Trash2, AlertTriangle, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { useToast } from "@/hooks/use-toast"
import type { Report } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { Label } from "../ui/label"

const tapeheadsOperatorSchema = z.object({
  date: z.date(),
  shift: z.coerce.number(),
  shift_lead_name: z.string(),
  th_number: z.string(),
  operator_name: z.string(),
  material_type: z.string(),
  end_of_shift_status: z.string(),
  order_entry: z.string().optional(),
  layer: z.string().optional(),
  shift_start_time: z.string(),
  shift_end_time: z.string(),
  total_meters: z.coerce.number(),
  total_tapes: z.coerce.number(),
  issues: z.array(z.object({
    problem_reason: z.string(),
    duration_minutes: z.coerce.number(),
  })).optional(),
  had_spin_out: z.boolean().default(false),
  spin_out_duration_minutes: z.coerce.number().optional(),
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
  leadComments: z.string().optional(),
});


export function TapeheadsReviewClient({ submissions }: { submissions: Report[] }) {
  const [isDialogOpen, setDialogOpen] = React.useState(false)
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof tapeheadsOperatorSchema>>({
    resolver: zodResolver(tapeheadsOperatorSchema),
  });
  
  const hadSpinOut = useWatch({ control: form.control, name: 'had_spin_out' });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "issues",
  });

  React.useEffect(() => {
    if (selectedReport) {
      form.reset({
        ...selectedReport,
        operator_name: selectedReport.operatorName,
        date: new Date(selectedReport.date),
        shift: Number(selectedReport.shift),
        issues: selectedReport.issues || [],
        checklist_items: selectedReport.checklist_items || {},
      })
    }
  }, [selectedReport, form])

  const handleReview = (report: Report) => {
    setSelectedReport(report)
    setDialogOpen(true)
  }

  function onSubmit(values: z.infer<typeof tapeheadsOperatorSchema>) {
    console.log(values)
    toast({
      title: "Report Updated",
      description: `Report for ${values.operator_name} has been saved.`,
    })
    setDialogOpen(false)
  }
  
  const handleDelete = (reportId: string) => {
    toast({
      title: "Report Deleted",
      description: `Report ${reportId} has been deleted.`,
      variant: 'destructive'
    })
  }

  const getTotalProblemDuration = (report: Report) => {
    return report.issues?.reduce((acc, issue) => acc + (issue.duration_minutes || 0), 0) || 0;
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Operator Entries ({submissions.length} entries)</h2>
        {submissions.map((report) => (
          <Card key={report.id}>
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{report.th_number}</Badge>
                <span className="font-semibold">{report.operatorName}</span>
                <Badge variant={report.end_of_shift_status === 'Completed' ? 'default' : 'secondary'}>{report.end_of_shift_status}</Badge>
                {report.had_spin_out && <Badge variant="destructive">Spin Out</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleReview(report)}><Edit className="mr-2"/>Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(report.id)}><Trash2 className="mr-2"/>Delete</Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Total Meters</Label>
                  <p className="font-medium">{report.total_meters}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Tapes</Label>
                  <p className="font-medium">{report.total_tapes}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Material</Label>
                  <p className="font-medium">{report.material_type}</p>
                </div>
                 <div>
                  <Label className="text-xs text-muted-foreground">End Status</Label>
                  <p className="font-medium">{report.end_of_shift_status}</p>
                </div>
              </div>
              {(report.issues && report.issues.length > 0) || report.had_spin_out ? (
                <div className="p-3 rounded-md bg-muted/50">
                   <h4 className="flex items-center text-sm font-semibold mb-2">
                      <AlertTriangle className="mr-2 text-yellow-600"/>
                      Problems/Downtime ({getTotalProblemDuration(report) + (report.spin_out_duration_minutes || 0)} min total)
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {report.issues?.map((issue, index) => (
                        <li key={index} className="flex justify-between items-center p-2 bg-background rounded">
                          <span>{issue.problem_reason}</span>
                          <Badge variant="secondary">{issue.duration_minutes} min</Badge>
                        </li>
                      ))}
                      {report.had_spin_out && (
                         <li className="flex justify-between items-center p-2 bg-red-100 dark:bg-red-900/30 rounded">
                           <div className="flex items-center">
                            <Checkbox checked className="mr-2" disabled/>
                            <span className="font-medium text-red-700 dark:text-red-300">Spin Out Occurred</span>
                           </div>
                           <Badge variant="destructive">{report.spin_out_duration_minutes} min</Badge>
                         </li>
                      )}
                    </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Review Tapeheads Operator Report</DialogTitle>
            <DialogDescription>
              Editing report from {selectedReport?.operatorName} for Shift {selectedReport?.shift}.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <FormField control={form.control} name="operator_name" render={({ field }) => (<FormItem><FormLabel>Operator</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}/>
                 <FormField control={form.control} name="shift" render={({ field }) => (<FormItem><FormLabel>Shift</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/>
                 <FormField control={form.control} name="th_number" render={({ field }) => (<FormItem><FormLabel>TH Number</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}/>
                 <FormField control={form.control} name="total_meters" render={({ field }) => (<FormItem><FormLabel>Total Meters</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/>
                 <FormField control={form.control} name="total_tapes" render={({ field }) => (<FormItem><FormLabel>Total Tapes</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/>
              </div>

              <Separator className="my-4" />
              <h4 className="text-md font-semibold">Issues & Downtime</h4>
              
              <div className="space-y-2">
                {fields.map((field, index) => (
                    <Card key={field.id} className="p-3 relative">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                         <FormField control={form.control} name={`issues.${index}.problem_reason`} render={({ field }) => ( <FormItem><FormLabel>Problem Reason</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )}/>
                         <FormField control={form.control} name={`issues.${index}.duration_minutes`} render={({ field }) => ( <FormItem><FormLabel>Duration (min)</FormLabel><FormControl><Input type="number" {...field}/></FormControl></FormItem> )}/>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive" onClick={() => remove(index)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </Card>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ problem_reason: '', duration_minutes: 0 })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Problem
                </Button>
              </div>

              <Separator className="my-4" />
              <h4 className="text-md font-semibold">Checklist</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="had_spin_out" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Had Spin Out?</FormLabel></FormItem>)} />
                {hadSpinOut && (
                  <FormField control={form.control} name="spin_out_duration_minutes" render={({ field }) => (<FormItem><FormLabel>Spin Out Duration (min)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                )}
                <FormField control={form.control} name="checklist_items.smooth_fuse_full" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Smooth Fuse Full</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.blades_glasses" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Blades Glasses</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.paperwork_up_to_date" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Paperwork Up To Date</FormLabel></FormItem>)} />
              </div>

              <Separator className="my-4" />
              <FormField control={form.control} name="leadComments" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift Lead Comments</FormLabel>
                    <FormControl><Textarea placeholder="Add your comments..." {...field} /></FormControl>
                    <FormMessage/>
                  </FormItem>
                )}/>
            </form>
          </Form>
           <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
