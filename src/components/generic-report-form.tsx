"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import type { Department } from "@/lib/types"
import { reportSchema } from "@/lib/schemas"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface GenericReportFormProps {
  department: Department;
}

const departmentConfig = {
  Pregger: { shifts: 3, fields: ['materialId', 'tasksCompleted', 'downtime'] },
  Tapeheads: { shifts: 3, fields: ['materialId', 'tasksCompleted', 'downtime'] },
  Gantry: { shifts: 3, fields: ['materialId', 'tasksCompleted', 'downtime'] },
  Films: { shifts: 1, fields: ['materialId', 'tasksCompleted'] },
  Graphics: { shifts: 1, fields: ['tasksCompleted', 'downtime'] },
};

export function GenericReportForm({ department }: GenericReportFormProps) {
  const { toast } = useToast();
  const config = departmentConfig[department];
  
  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      operatorName: "",
      shift: 1,
      comments: "",
      materialId: "",
      tasksCompleted: 0,
      downtime: 0,
    },
  });

  function onSubmit(values: z.infer<typeof reportSchema>) {
    console.log(values);
    toast({
      title: "Report Submitted!",
      description: `Your report for ${department} has been successfully submitted.`,
    });
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{department} Report</CardTitle>
        <CardDescription>Fill out the details for your shift.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="operatorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operator Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {config.shifts > 1 && (
                 <FormField
                  control={form.control}
                  name="shift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a shift" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(config.shifts)].map((_, i) => (
                            <SelectItem key={i+1} value={String(i+1)}>Shift {i+1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
               {config.fields.includes('materialId') && (
                <FormField
                  control={form.control}
                  name="materialId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., M-123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {config.fields.includes('tasksCompleted') && (
                <FormField
                  control={form.control}
                  name="tasksCompleted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasks Completed</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(+e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {config.fields.includes('downtime') && (
                <FormField
                  control={form.control}
                  name="downtime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Downtime (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="0.0" onChange={e => field.onChange(+e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments / Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any issues or comments for this shift..."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide any additional details about your shift.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit Report</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
