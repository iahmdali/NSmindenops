
"use client";

import type { SailProgress, DepartmentProgress } from "@/lib/sail-progress-types";
import { getRecentSails, searchSails } from "@/lib/sail-progress-logic";
import { PageHeader } from "../page-header";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, ChevronsRight, PackageSearch, ArrowRight } from "lucide-react";
import React, { useState, useEffect } from 'react';

function DepartmentCard({ dept }: { dept: DepartmentProgress }) {
    const statusConfig = {
        Completed: { color: 'border-green-500', icon: CheckCircle },
        'In Progress': { color: 'border-blue-500', icon: ChevronsRight },
        'Issues Logged': { color: 'border-red-500', icon: AlertTriangle },
        Pending: { color: 'border-gray-400', icon: PackageSearch },
    };
    const { color, icon: Icon } = statusConfig[dept.status] || statusConfig.Pending;

    return (
        <Card className={cn("shadow-sm", color)}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                    <Icon className={cn("h-6 w-6", color.replace('border-', 'text-'))} />
                </div>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2 text-sm">
                    {dept.details.map((detail, index) => (
                        <li key={index} className="flex justify-between">
                            <span className="font-medium text-muted-foreground">{detail.label}:</span>
                            <span className="text-right">{detail.value}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

function ProgressTimeline({ progress }: { progress: DepartmentProgress[] }) {
    const orderedDepts = ['Films', 'Gantry', 'Tapeheads', 'QC'];
    const statusConfig = {
        Completed: { color: 'bg-green-500' },
        'In Progress': { color: 'bg-blue-500' },
        'Issues Logged': { color: 'bg-red-500' },
        Pending: { color: 'bg-gray-400' },
    };

    return (
        <div className="flex items-center justify-center p-4 rounded-lg bg-muted/50">
            {orderedDepts.map((deptName, index) => {
                 const dept = progress.find(d => d.name === deptName);
                 const status = dept?.status || 'Pending';
                 const { color } = statusConfig[status];

                return (
                    <React.Fragment key={deptName}>
                        <div className="flex flex-col items-center text-center">
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white", color)}>
                                {status === 'Completed' ? <CheckCircle className="h-4 w-4"/> : <span className="text-xs font-bold">{index + 1}</span>}
                            </div>
                            <p className="text-sm mt-1">{deptName}</p>
                            <p className="text-xs text-muted-foreground">{status}</p>
                        </div>
                        {index < orderedDepts.length - 1 && (
                            <div className="flex-1 h-1 bg-border mx-2">
                                <div className={cn("h-full", status === 'Completed' ? color : 'bg-border')} style={{width: '100%'}}/>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}


export function SailProgressViewer({ sailId }: { sailId: string }) {
    const [sail, setSail] = useState<SailProgress | null>(null);

    useEffect(() => {
        const allSails = [...getRecentSails(50), ...searchSails(sailId)];
        const foundSail = allSails.find(s => s.id === sailId);
        setSail(foundSail || null);
    }, [sailId]);

    if (!sail) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold">Sail Not Found</h1>
                <p className="text-muted-foreground">Could not find progress details for sail ID: {sailId}</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-6">
            <PageHeader title={`Sail Progress: ${sail.sailNumber}`} description={`Tracking all work associated with OE Base: ${sail.base}`} />
            
            <Card>
                 <CardHeader>
                    <CardTitle>Overall Status</CardTitle>
                </CardHeader>
                <CardContent>
                     <ProgressTimeline progress={sail.progress} />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Department Breakdown</CardTitle>
                    <CardDescription>Status and key metrics from each department involved.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {sail.progress.map(dept => <DepartmentCard key={dept.id} dept={dept} />)}
                </CardContent>
            </Card>
        </div>
    );
}
