
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

function SubmittedReportCard({ report }: { report: Report }) {
    return (
        <Card className="shadow-md transition-all hover:shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{report.oeNumber}-{report.section}</CardTitle>
                        <CardDescription>
                            <span className="font-semibold">Operator:</span> {report.operatorName} on {report.thNumber}
                        </CardDescription>
                    </div>
                     <Badge variant={'secondary'}>
                           <CheckCircle className="mr-1 h-3 w-3" />
                           Submitted
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{report.total_meters}m produced in {report.hoursWorked}h. Status: {report.endOfShiftStatus}</p>
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
