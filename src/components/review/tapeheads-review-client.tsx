"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { MoreHorizontal, CheckCircle, AlertCircle, Clock } from "lucide-react"
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

const statusConfig = {
  Approved: { icon: CheckCircle, color: "bg-green-500" },
  Submitted: { icon: Clock, color: "bg-blue-500" },
  "Requires Attention": { icon: AlertCircle, color: "bg-yellow-500" },
}

export function TapeheadsReviewClient({ submissions }: { submissions: Report[] }) {
  const [isDialogOpen, setDialogOpen] = React.useState(false)
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
  })

  React.useEffect(() => {
    if (selectedReport) {
      form.reset({
        ...selectedReport,
        date: new Date(selectedReport.date),
      })
    }
  }, [selectedReport, form])

  const handleReview = (report: Report) => {
    setSelectedReport(report)
    setDialogOpen(true)
  }

  function onSubmit(values: z.infer<typeof reportSchema>) {
    console.log(values)
    toast({
      title: "Report Updated",
      description: `Report for ${values.operatorName} has been saved.`,
    })
    setDialogOpen(false)
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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Review Report</DialogTitle>
            <DialogDescription>
              Reviewing report from {selectedReport?.operatorName} for Shift {selectedReport?.shift}.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={form.control} name="operatorName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operator</FormLabel>
                      <FormControl><Input {...field} readOnly /></FormControl>
                    </FormItem>
                  )}/>
                <FormField control={form.control} name="shift" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )}/>
                <FormField control={form.control} name="materialId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material ID</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )}/>
                <FormField control={form.control} name="tasksCompleted" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasks Completed</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )}/>
                <FormField control={form.control} name="downtime" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Downtime (hrs)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                    </FormItem>
                  )}/>
              </div>
              <FormField control={form.control} name="comments" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operator Comments</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                  </FormItem>
                )}/>
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
