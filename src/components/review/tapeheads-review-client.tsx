
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { MoreHorizontal, CheckCircle, AlertCircle, Clock, PlusCircle, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { reportSchema } from "@/lib/schemas"
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
import { Card } from "../ui/card"
import { Separator } from "../ui/separator"

const statusConfig = {
  Approved: { icon: CheckCircle, color: "bg-green-500" },
  Submitted: { icon: Clock, color: "bg-blue-500" },
  "Requires Attention": { icon: AlertCircle, color: "bg-yellow-500" },
}

const tapeheadsOperatorSchema = z.object({
  // Adding fields from the operator form for editing
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
  checklist_items: z.object({
    smooth_fuse_full: z.boolean().default(false),
    blades_glasses: z.boolean().default(false),
    spray_tracks_on_bridge: z.boolean().default(false),
    meter_stick: z.boolean().default(false),
  }).default({}),
  leadComments: z.string().optional(),
});


export function TapeheadsReviewClient({ submissions }: { submissions: Report[] }) {
  const [isDialogOpen, setDialogOpen] = React.useState(false)
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null)
  const { toast } = useToast()

  // Use the new detailed schema
  const form = useForm<z.infer<typeof tapeheadsOperatorSchema>>({
    resolver: zodResolver(tapeheadsOperatorSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "issues",
  });

  React.useEffect(() => {
    if (selectedReport) {
      form.reset({
        ...selectedReport,
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

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total Meters</TableHead>
              <TableHead>Issues</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((report) => {
              const StatusIcon = statusConfig[report.status].icon
              const statusColor = statusConfig[report.status].color
              return (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-2 pl-2">
                       <span className={cn("h-2 w-2 rounded-full", statusColor)}></span>
                       {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.operatorName}</TableCell>
                  <TableCell>{report.shift}</TableCell>
                  <TableCell>{format(new Date(report.date), "PPP")}</TableCell>
                  <TableCell>{report.total_meters || 'N/A'}</TableCell>
                  <TableCell>{report.issues?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleReview(report)}>
                          Review / Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>Approve</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(report.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
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
                <FormField control={form.control} name="checklist_items.smooth_fuse_full" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Smooth Fuse Full</FormLabel></FormItem>)} />
                <FormField control={form.control} name="checklist_items.blades_glasses" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Blades Glasses</FormLabel></FormItem>)} />
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
