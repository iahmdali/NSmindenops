
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from './page-header';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { CheckCircle, Edit } from 'lucide-react';
import { tapeheadsSubmissions } from '@/lib/tapeheads-data';
import type { Report } from '@/lib/types';
import { Progress } from './ui/progress';

function SubmittedReportCard({ report }: { report: Report }) {
    const checklistItems = report.checklist_items ? Object.values(report.checklist_items) : [];
    const checklistCompleted = checklistItems.filter(Boolean).length;
    const checklistTotal = checklistItems.length;
    const checklistPercentage = checklistTotal > 0 ? (checklistCompleted / checklistTotal) * 100 : 0;
    
    const panelText = report.panels_worked_on?.join(', ');

    return (
        <Card className="shadow-md transition-all hover:shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{report.oeNumber}-{report.section}</CardTitle>
                        <CardDescription>
                            <span className="font-semibold">Panels:</span> {panelText}
                        </CardDescription>
                    </div>
                     <Badge variant={'secondary'}>
                           <CheckCircle className="mr-1 h-3 w-3" />
                           Submitted
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    {report.total_meters}m produced on {report.th_number}
                </p>
                <div>
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Checklist</span>
                        <span className="text-xs font-semibold">{checklistPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={checklistPercentage} className="h-2" />
                </div>
            </CardContent>
        </Card>
    );
}

export function TapeheadsWorkDashboard() {
    const [reports, setReports] = useState<Report[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const currentReports = tapeheadsSubmissions as Report[];
            if (reports.length !== currentReports.length) {
                 setReports([...currentReports]);
            }
        }, 500);
        
        return () => clearInterval(interval);
    }, [reports]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Tapeheads Dashboard"
                description="Record your work for a new OE section or review recent submissions."
            >
                <Button asChild size="lg">
                    <Link href="/report/tapeheads/entry">Record Work</Link>
                </Button>
            </PageHeader>
            
            <h2 className="text-xl font-semibold tracking-tight">Recent Submissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {reports.length > 0 ? (
                    reports.map(report => <SubmittedReportCard key={report.id} report={report} />)
                ) : (
                    <Card className="col-span-full">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            No shift reports have been submitted yet.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
