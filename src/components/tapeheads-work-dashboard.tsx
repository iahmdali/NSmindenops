
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { oeJobs, type OeSection } from "@/lib/oe-data";
import { PageHeader } from './page-header';
import Link from 'next/link';

function OeSectionCard({ section }: { section: OeSection }) {
    const getStatusClasses = () => {
        switch(section.status) {
            case 'completed': return 'border-green-500 bg-green-50';
            case 'in-progress': return 'border-yellow-500 bg-yellow-50';
            default: return 'border-gray-200 bg-white';
        }
    }

    return (
        <Card className={`shadow-md transition-all hover:shadow-lg ${getStatusClasses()}`}>
            <CardHeader>
                <CardTitle className="text-lg">{section.oeBase}-{section.sectionId}</CardTitle>
                <CardDescription>
                    <span className="font-semibold">Panels:</span> {section.panels}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href={`/report/tapeheads/entry?oe=${section.oeBase}&section=${section.sectionId}`} passHref>
                    <Button className="w-full">Enter Work Entry</Button>
                </Link>
            </CardContent>
        </Card>
    );
}

export function TapeheadsWorkDashboard() {
    const [jobs, setJobs] = useState<OeSection[]>([]);

    useEffect(() => {
        // In a real app, you'd fetch this data. Here, we're reading from our mock store.
        setJobs(oeJobs);
    }, []);

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
                    <p className="text-muted-foreground col-span-full text-center">No active work items found.</p>
                )}
            </div>
        </div>
    )
}
