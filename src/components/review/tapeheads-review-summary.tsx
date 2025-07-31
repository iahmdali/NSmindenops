
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tapeheadsSubmissions } from '@/lib/tapeheads-data';
import type { Report, WorkItem } from '@/lib/types';
import { isSameDay } from 'date-fns';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { summarizeShift } from '@/ai/flows/summarize-shift-flow';
import { Badge } from '../ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { TapeheadsOperatorForm } from '../tapeheads-operator-form';

const reviewSchema = z.object({
  date: z.date(),
  shift: z.string(),
  shiftLeadName: z.string().min(1, "Shift lead name is required."),
  comments: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

function OperatorSubmissionCard({ report, onDelete, onEdit }: { report: Report, onDelete: (id: string) => void, onEdit: (report: Report) => void }) {
    const calculateHours = (startTimeStr?: string, endTimeStr?: string): number => {
        if (!startTimeStr || !endTimeStr) return 0;
        const [startH, startM] = startTimeStr.split(':').map(Number);
        const [endH, endM] = endTimeStr.split(':').map(Number);
        const startDate = new Date(0, 0, 0, startH, startM);
        let endDate = new Date(0, 0, 0, endH, endM);
        if (endDate < startDate) {
            endDate.setDate(endDate.getDate() + 1);
        }
        const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        return parseFloat(diff.toFixed(1));
    }

    const hours = calculateHours(report.shiftStartTime, report.shiftEndTime);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base">{report.operatorName}</CardTitle>
                        <CardDescription>on {report.thNumber} for {hours}h</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(report)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(report.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.workItems?.map((item, index) => (
                <div key={index} className="p-2 border rounded-md bg-muted/30 text-sm">
                   <div className="flex justify-between font-semibold">
                       <span>{item.oeNumber}-{item.section}</span>
                       <Badge variant={item.endOfShiftStatus === 'Completed' ? 'default' : 'outline'}>
                         {item.endOfShiftStatus} {item.endOfShiftStatus === 'In Progress' && `(${item.layer})`}
                       </Badge>
                   </div>
                   <div className="text-xs text-muted-foreground mt-1">
                      {item.panelsWorkedOn.join(', ')}
                   </div>
                    <div className="text-xs mt-1">
                      {item.total_meters}m on {item.materialType}
                   </div>
                   {item.had_spin_out && (
                     <div className="text-xs text-destructive font-semibold mt-1">Spin-Out ({item.spin_out_duration_minutes || 0} min)</div>
                   )}
                </div>
              ))}
            </CardContent>
        </Card>
    )
}


export function TapeheadsReviewSummary() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState<Report | undefined>();

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

    if (!selectedDate || !selectedShift) {
        toast({ title: "Please select date and shift", variant: "destructive" });
        return;
    }

    const filtered = tapeheadsSubmissions.filter(s =>
      isSameDay(new Date(s.date), selectedDate) && String(s.shift) === selectedShift
    );
    setSubmissions(filtered);
    setAiSummary(''); 
  };

  const handleDeleteReport = (id: string) => {
    // Find the index in the global data store
    const reportIndex = tapeheadsSubmissions.findIndex(report => report.id === id);
    if(reportIndex !== -1) {
        tapeheadsSubmissions.splice(reportIndex, 1);
        toast({
            title: "Report Deleted",
            description: "The operator submission has been removed.",
        });
    }
    // Refresh the local state
    handleLoadSubmissions();
  };
  
  const handleEditReport = (report: Report) => {
    setReportToEdit(report);
    setEditDialogOpen(true);
  };
  
  const handleUpdateReport = (updatedReport: Report) => {
    const reportIndex = tapeheadsSubmissions.findIndex(r => r.id === updatedReport.id);
    if (reportIndex !== -1) {
        tapeheadsSubmissions[reportIndex] = updatedReport;
    }
    setEditDialogOpen(false);
    setReportToEdit(undefined);
    handleLoadSubmissions(); // Refresh the list
  }
  
  useEffect(() => {
    handleLoadSubmissions();
  }, [date, shift]);
  
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
    const allWorkItems = submissions.flatMap(s => s.workItems || []);
    
    const totalMeters = allWorkItems.reduce((sum, item) => sum + item.total_meters, 0);
    const totalTapes = allWorkItems.reduce((sum, item) => sum + item.total_tapes, 0);
    const totalHours = submissions.reduce((sum, s) => sum + (s.hoursWorked || 0), 0);
    
    const totalSpinOuts = allWorkItems.filter(item => item.had_spin_out).length;
    const spinOutDowntime = allWorkItems.reduce((sum, item) => sum + (item.spin_out_duration_minutes || 0), 0);
    
    const problemDowntime = allWorkItems.reduce((sum, item) => sum + (item.issues?.reduce((iSum, i) => iSum + (i.duration_minutes || 0), 0) || 0), 0);
    const totalDowntime = spinOutDowntime + problemDowntime;

    const allPanels = allWorkItems.flatMap(item => item.panelsWorkedOn || []);
    const uniquePanelsWorked = new Set(allPanels).size;
    const nestedPanelCount = allWorkItems.reduce((sum, item) => sum + (item.nestedPanels?.length || 0), 0);
    
    const averageMpmh = totalHours > 0 ? (totalMeters / totalHours) : 0;
    
    const workOrdersProcessed = allWorkItems.reduce((acc, item) => {
        const key = `${item.oeNumber || 'N/A'}-${item.section || 'N/A'}`;
        if (!acc[key]) {
            acc[key] = new Set<string>();
        }
        item.panelsWorkedOn?.forEach(p => acc[key].add(p));
        return acc;
    }, {} as Record<string, Set<string>>);


    return {
      totalMeters, totalTapes, totalHours, totalDowntime,
      totalSpinOuts, uniquePanelsWorked, nestedPanelCount,
      averageMpmh: averageMpmh.toFixed(1),
      workOrdersProcessed
    };
  }, [submissions]);

  const onSubmit = (data: ReviewFormValues) => {
    console.log("Finalized Report:", { ...data, submissions, summaryStats });
    toast({
      title: 'Report Finalized',
      description: `Shift ${data.shift} for ${data.date.toLocaleDateString()} has been finalized.`,
    });
  };

  return (
    <div className="space-y-6">
       <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Operator Submission</DialogTitle>
          </DialogHeader>
          <div className="p-1">
             <TapeheadsOperatorForm reportToEdit={reportToEdit} onFormSubmit={handleUpdateReport} />
          </div>
        </DialogContent>
      </Dialog>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shift Review and Finalization</CardTitle>
              <CardDescription>Select a date and shift to load operator submissions for review.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="shift" render={({ field }) => (<FormItem><FormLabel>Shift</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="1">Shift 1</SelectItem><SelectItem value="2">Shift 2</SelectItem><SelectItem value="3">Shift 3</SelectItem></SelectContent></Select></FormItem>)} />
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
                        {isLoading && <p className="text-muted-foreground animate-pulse">Generating AI summary...</p>}
                        {aiSummary && <p className="text-sm p-4 bg-muted rounded-md whitespace-pre-wrap">{aiSummary}</p>}
                    </CardContent>
                </Card>

              <Card>
                <CardHeader><CardTitle>Shift Totals & Averages</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  <Card><CardHeader className="p-4"><CardTitle>{summaryStats.totalMeters}m</CardTitle><CardDescription>Total Meters</CardDescription></CardHeader></Card>
                  <Card><CardHeader className="p-4"><CardTitle>{summaryStats.totalHours}h</CardTitle><CardDescription>Total Hours</CardDescription></CardHeader></Card>
                  <Card><CardHeader className="p-4"><CardTitle>{summaryStats.totalDowntime}m</CardTitle><CardDescription>Total Downtime</CardDescription></CardHeader></Card>
                  <Card><CardHeader className="p-4"><CardTitle>{summaryStats.averageMpmh}</CardTitle><CardDescription>Avg. m/hr</CardDescription></CardHeader></Card>
                  <Card><CardHeader className="p-4"><CardTitle>{summaryStats.totalTapes}</CardTitle><CardDescription>Total Tapes</CardDescription></CardHeader></Card>
                  <Card><CardHeader className="p-4"><CardTitle>{summaryStats.totalSpinOuts}</CardTitle><CardDescription>Spin Outs</CardDescription></CardHeader></Card>
                  <Card><CardHeader className="p-4"><CardTitle>{summaryStats.uniquePanelsWorked}</CardTitle><CardDescription>Unique Panels</CardDescription></CardHeader></Card>
                  <Card><CardHeader className="p-4"><CardTitle>{summaryStats.nestedPanelCount}</CardTitle><CardDescription>Nested Panels</CardDescription></CardHeader></Card>
                  <Card className="col-span-2 xl:col-span-2">
                      <CardHeader className="p-4">
                          <CardTitle>Work Orders Processed</CardTitle>
                          <CardDescription className="space-y-1 pt-2">
                              {Object.entries(summaryStats.workOrdersProcessed).map(([oeSection, panels]) => (
                                  <div key={oeSection} className="text-xs">
                                      <span className="font-bold">{oeSection}:</span>
                                      <span className="text-muted-foreground ml-2">{Array.from(panels).join(', ')}</span>
                                  </div>
                              ))}
                          </CardDescription>
                      </CardHeader>
                  </Card>
                </CardContent>
              </Card>
              
               <Card>
                    <CardHeader><CardTitle>Operator Submissions ({submissions.length})</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {submissions.map(report => <OperatorSubmissionCard key={report.id} report={report} onDelete={handleDeleteReport} onEdit={handleEditReport} />)}
                    </CardContent>
               </Card>

               <Card>
                    <CardHeader><CardTitle>Final Comments & Submission</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="shiftLeadName" render={({ field }) => (<FormItem><FormLabel>Final Shift Lead Name</FormLabel><FormControl><Input placeholder="Enter your name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="comments" render={({ field }) => (<FormItem><FormLabel>Shift-wide Comments</FormLabel><FormControl><Textarea placeholder="Add final comments for the shift..." {...field} /></FormControl></FormItem>)} />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button type="button" variant="secondary">Save as Draft</Button>
                        <Button type="submit">Finalize Report</Button>
                    </CardFooter>
                </Card>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
