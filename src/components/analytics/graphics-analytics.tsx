
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, PackageCheck } from "lucide-react";
import { format, isSameDay } from 'date-fns';
import { graphicsTasksData, type GraphicsTask } from '@/lib/graphics-data';

export function GraphicsAnalytics() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    // Add a state to force re-render when underlying data changes
    const [tasks, setTasks] = useState<GraphicsTask[]>(graphicsTasksData);

    useEffect(() => {
        // This is a bit of a hack for this demo to force re-renders
        // as components outside this one modify the shared graphicsTasksData array.
        const interval = setInterval(() => {
            if (tasks.length !== graphicsTasksData.length) {
                setTasks([...graphicsTasksData]);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [tasks.length]);


    const dailyData = useMemo(() => {
        if (!date) {
            return {
                startedTasks: [],
                completedTasks: [],
                readyForShippingTags: [],
            };
        }

        const tasksToday = graphicsTasksData.filter(task => {
            const taskDate = task.completedAt || task.startedAt;
            return taskDate && isSameDay(new Date(taskDate), date);
        });

        const startedTasks = tasksToday; // All tasks with a date for today were started
        const completedTasks = tasksToday.filter(task => task.status === 'done');
        
        // Logic to determine which tags are ready for shipping
        const readyForShippingTags = Array.from(new Set(
            graphicsTasksData
                .filter(t => t.isFinished)
                .map(t => t.tagId)
        ));


        return {
            startedTasks,
            completedTasks,
            readyForShippingTags,
        };
    }, [date, tasks]);
    
    const summaryStats = useMemo(() => {
        const totalCompleted = dailyData.completedTasks.length;
        const totalDuration = dailyData.completedTasks.reduce((acc, task) => acc + (task.durationMins || 0), 0);
        const uniquePersonnel = new Set(dailyData.completedTasks.map(t => t.personnelCount || 1).flat()).size;

        return {
            totalCompleted,
            totalDuration,
            uniquePersonnel,
            avgDuration: totalCompleted > 0 ? (totalDuration / totalCompleted).toFixed(1) : 0,
        };
    }, [dailyData.completedTasks]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Select Date</CardTitle>
                    <CardDescription>Pick a date to view the activity summary for the Graphics department.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DatePicker value={date} onChange={setDate} />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalCompleted}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Work Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalDuration} <span className="text-xs text-muted-foreground">mins</span></div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Task Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.avgDuration} <span className="text-xs text-muted-foreground">mins</span></div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ready for Shipping</CardTitle>
                        <PackageCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dailyData.readyForShippingTags.length}</div>
                    </CardContent>
                </Card>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Tasks Completed Today</CardTitle>
                    <CardDescription>All tasks moved to the "Completed" column on {date ? format(date, 'PPP') : ''}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tag ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Content</TableHead>
                                <TableHead>Duration (min)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {dailyData.completedTasks.length > 0 ? dailyData.completedTasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell><Badge variant="secondary">{task.tagId}</Badge></TableCell>
                                    <TableCell className="capitalize">{task.type}</TableCell>
                                    <TableCell>{task.content}</TableCell>
                                    <TableCell>{task.durationMins}</TableCell>
                                </TableRow>
                            )) : (
                               <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No tasks completed on this day.</TableCell></TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Card>
                    <CardHeader><CardTitle>Ready for Shipping</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                           {dailyData.readyForShippingTags.length > 0 ? dailyData.readyForShippingTags.map(tagId => (
                                <li key={tagId} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                                    <PackageCheck className="h-5 w-5 text-green-600"/>
                                    <span className="font-mono">{tagId}</span>
                                </li>
                           )) : (
                                <p className="text-sm text-muted-foreground">No tags were marked as ready for shipping.</p>
                           )}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Tasks Started Today</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                           {dailyData.startedTasks.length > 0 ? dailyData.startedTasks.map(task => (
                                <li key={task.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                                    <span className="font-mono text-xs"><Badge variant="outline">{task.tagId}</Badge></span>
                                    <span className="text-sm truncate">{task.content}</span>
                                </li>
                           )) : (
                               <p className="text-sm text-muted-foreground">No tasks were started on this day.</p>
                           )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
