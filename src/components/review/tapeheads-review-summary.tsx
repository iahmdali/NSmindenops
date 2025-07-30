
"use client";

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tapeheadsSubmissions } from '@/lib/tapeheads-data';
import type { Report } from '@/lib/types';
import { isSameDay } from 'date-fns';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { summarizeShift } from '@/ai/flows/summarize-shift-flow';

const reviewSchema = z.object({
  date: z.date(),
  shift: z.string(),
  shiftLeadName: z.string().min(1, "Shift lead name is required."),
  comments: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export function TapeheadsReviewSummary() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      date: new Date(),
      shift: "1",
      shiftLeadName: "",
    },
  });

  const { date, shift } = form.watch();

  const handleLoadSubmissions = () => {
    const selectedDate = form.getValues('date');
    const selectedShift = form.getValues('shift');

    const filtered = tapeheadsSubmissions.filter(s =>
      isSameDay(s.date, selectedDate) && String(s.shift) === selectedShift
    );
    setSubmissions(filtered);
    setAiSummary(''); // Reset summary when loading new data
  };
  
  const handleGenerateSummary = async () => {
    if (submissions.length === 0) {
        toast({ title: "No data", description: "Load submissions before generating a summary.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    setAiSummary('');
    try {
        const summary = await summarizeShift(submissions);
        setAiSummary(summary);
    } catch (e) {
        console.error(e);
        toast({ title: "Error", description: "Failed to generate AI summary.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }


  const summaryStats = useMemo(() => {
    const totalMeters = submissions.reduce((sum, s) => sum + (s.total_meters || 0), 0);
    const totalTapes = submissions.reduce((sum, s) => sum + (s.total_tapes || 0), 0);
    const totalHours = submissions.reduce((sum, s) => sum + (s.hoursWorked || 0), 0);
    
    const totalSpinOuts = submissions.filter(s => s.had_spin_out).length;
    const spinOutDowntime = submissions.reduce((sum, s) => sum + (s.spin_out_duration_minutes || 0), 0);
    
    const problemDowntime = submissions.reduce((sum, s) => sum + (s.issues?.reduce((iSum, i) => iSum + (i.duration_minutes || 0), 0) || 0), 0);
    const totalDowntime = spinOutDowntime + problemDowntime;

    const allPanels = submissions.flatMap(s => s.panels_worked_on || []);
    const uniquePanelsWorked = new Set(allPanels).size;
    const nestedPanelCount = submissions.reduce((sum, s) => sum + (s.nested_panels?.length || 0), 0);

    const averageMpmh = totalHours > 0 ? (totalMeters / totalHours) : 0;

    return {
      totalMeters, totalTapes, totalHours, totalDowntime,
      totalSpinOuts, uniquePanelsWorked, nestedPanelCount,
      averageMpmh: averageMpmh.toFixed(1)
    };
  }, [submissions]);

  const onSubmit = (data: ReviewFormValues) => {
    console.log("Finalized Report:", { ...data, submissions });
    toast({
      title: 'Report Finalized',
      description: `Shift ${data.shift} for ${data.date.toLocaleDateString()} has been finalized.`,
    });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shift Review and Finalization</CardTitle>
              <CardDescription>Load, review, and finalize operator submissions for a specific shift.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="shift" render={({ field }) => (<FormItem><FormLabel>Shift</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">Shift 1</SelectItem><SelectItem value="2">Shift 2</SelectItem><SelectItem value="3">Shift 3</SelectItem></SelectContent></Select></FormItem>)} />
                <Button type="button" onClick={handleLoadSubmissions}>Load Submissions</Button>
              </div>
            </CardContent>
          </Card>

          {submissions.length > 0 && (
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>AI-Generated Summary</CardTitle>
                            <Button type="button" onClick={handleGenerateSummary} disabled={isLoading}>
                                {isLoading ? 'Generating...' : 'Generate Summary'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading && <p className="text-muted-foreground">Generating AI summary...</p>}
                        {aiSummary && <p className="text-sm p-4 bg-muted rounded-md">{aiSummary}</p>}
                    </CardContent>
                </Card>


              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card><CardHeader><CardTitle>{summaryStats.totalMeters}m</CardTitle><CardDescription>Total Meters</CardDescription></CardHeader></Card>
                  <Card><CardHeader><CardTitle>{summaryStats.totalHours}h</CardTitle><CardDescription>Total Hours</CardDescription></CardHeader></Card>
                  <Card><CardHeader><CardTitle>{summaryStats.totalDowntime}m</CardTitle><CardDescription>Total Downtime</CardDescription></CardHeader></Card>
                  <Card><CardHeader><CardTitle>{summaryStats.averageMpmh}</CardTitle><CardDescription>Avg. m/hr</CardDescription></CardHeader></Card>
                  <Card><CardHeader><CardTitle>{summaryStats.totalSpinOuts}</CardTitle><CardDescription>Spin Outs</CardDescription></CardHeader></Card>
                  <Card><CardHeader><CardTitle>{summaryStats.uniquePanelsWorked}</CardTitle><CardDescription>Unique Panels</CardDescription></CardHeader></Card>
              </div>

               <Card>
                    <CardHeader><CardTitle>Final Comments & Submission</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="shiftLeadName" render={({ field }) => (<FormItem><FormLabel>Final Shift Lead Name</FormLabel><FormControl><Input placeholder="Enter your name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="comments" render={({ field }) => (<FormItem><FormLabel>Shift-wide Comments</FormLabel><FormControl><Textarea placeholder="Add final comments for the shift..." {...field} /></FormControl></FormItem>)} />
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="secondary">Save as Draft</Button>
                            <Button type="submit">Finalize Report</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
