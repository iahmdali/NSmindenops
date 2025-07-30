
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { oeJobs, type OeSection } from "@/lib/oe-data";
import { PageHeader } from './page-header';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { CheckCircle, Edit } from 'lucide-react';

function OeSectionCard({ section }: { section: OeSection }) {
    const getStatusClasses = () => {
        switch(section.status) {
            case 'completed': return 'border-blue-500 bg-blue-50';
            case 'in-progress': return 'border-green-500 bg-green-50';
            default: return 'border-gray-200 bg-white';
        }
    }

    const isActionable = section.status === 'pending';

    return (
        <Card className={`shadow-md transition-all hover:shadow-lg ${getStatusClasses()}`}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{section.oeBase}-{section.sectionId}</CardTitle>
                        <CardDescription>
                            <span className="font-semibold">Panels:</span> {section.panels}
                        </CardDescription>
                    </div>
                     {section.status !== 'pending' && (
                        <Badge variant={section.status === 'in-progress' ? 'default' : 'secondary'}>
                           {section.status === 'in-progress' && <Edit className="mr-1 h-3 w-3" />}
                           {section.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                           {section.status === 'in-progress' ? 'Submitted' : 'Finalized'}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Link href={`/report/tapeheads/entry?oe=${section.oeBase}&section=${section.sectionId}`} passHref>
                    <Button className="w-full" disabled={!isActionable}>
                        {isActionable ? 'Enter Work Entry' : 'View Entry'}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

export function TapeheadsWorkDashboard() {
    const [jobs, setJobs] = useState<OeSection[]>([]);

    useEffect(() => {
        // In a real app, you'd fetch this data. Here, we're simulating a refresh
        // by creating a new array from the (potentially mutated) oeJobs source.
        const interval = setInterval(() => {
            if (jobs.length !== oeJobs.length || jobs !== oeJobs) {
                 setJobs([...oeJobs]);
            }
        }, 500); // Check for updates every 0.5 seconds
        
        return () => clearInterval(interval);
    }, [jobs]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Tapeheads Dashboard"
                description="Select an OE section to enter your shift work."
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {jobs.length > 0 ? (
                    jobs.map(job => <OeSectionCard key={job.id} section={job} />)
                ) : (
                    <Card className="col-span-full">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            No active work items found. Please use the "File System Module" below to initialize a new OE job.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
