
"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { Task } from './graphics-kanban-board';

interface TaskCardProps {
    task: Task;
    onUpdate: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

const cuttingWorkTypes = ["Cutting", "Masking", "Weeding", "Rolling", "Printing"];
const inkingWorkTypes = ["Layout", "Masking", "Fold", "Mixing Ink", "Touch-up"];

export function GraphicsTaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
    const isSail = task.tagType === 'Sail';
    const isDoubleSided = isSail && task.sidedness === 'Double-Sided';

    const workTypes = task.type === 'cutting' ? cuttingWorkTypes : inkingWorkTypes;

    const handleFieldChange = (field: keyof Task, value: any) => {
        onUpdate({ ...task, [field]: value });
    };

    const handleWorkTypeChange = (item: string, checked: boolean) => {
        const currentTypes = task.workTypes || [];
        const newTypes = checked
            ? [...currentTypes, item]
            : currentTypes.filter(wt => wt !== item);
        onUpdate({ ...task, workTypes: newTypes });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="p-2 group cursor-pointer hover:bg-muted/80">
                    <div className="flex">
                        <div className="p-2 text-muted-foreground cursor-grab group-hover:text-foreground">
                            <GripVertical size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{task.tagId || 'New Task'}</p>
                            <p className="text-xs text-muted-foreground">{task.content}</p>
                        </div>
                    </div>
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Task: {task.tagId}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tag ID</Label>
                            <Input value={task.tagId} onChange={e => handleFieldChange('tagId', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                             <Label>Tag Type</Label>
                             <RadioGroup value={task.tagType} onValueChange={val => handleFieldChange('tagType', val)} className="flex items-center space-x-4 h-10">
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Sail" /></FormControl><Label className="font-normal">Sail</Label></FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Decal" /></FormControl><Label className="font-normal">Decal</Label></FormItem>
                             </RadioGroup>
                        </div>
                    </div>

                    {isSail && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Sidedness</Label>
                                 <RadioGroup value={task.sidedness} onValueChange={val => handleFieldChange('sidedness', val)} className="flex items-center space-x-4 h-10">
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Single-Sided" /></FormControl><Label className="font-normal">Single-Sided</Label></FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Double-Sided" /></FormControl><Label className="font-normal">Double-Sided</Label></FormItem>
                                </RadioGroup>
                            </div>
                            {isDoubleSided && (
                                <div className="space-y-2">
                                    <Label>Side of Work</Label>
                                    <Select value={task.sideOfWork} onValueChange={val => handleFieldChange('sideOfWork', val)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="Front">Front</SelectItem><SelectItem value="Back">Back</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                        <Label>Work Type(s)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {workTypes.map(item => (
                                <div key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                    <Checkbox
                                        checked={task.workTypes?.includes(item)}
                                        onCheckedChange={checked => handleWorkTypeChange(item, !!checked)}
                                    />
                                    <Label className="font-normal">{item}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Duration (mins)</Label>
                            <Input type="number" value={task.durationMins} onChange={e => handleFieldChange('durationMins', e.target.valueAsNumber)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Personnel Count</Label>
                            <Input type="number" value={task.personnelCount} onChange={e => handleFieldChange('personnelCount', e.target.valueAsNumber)} />
                        </div>
                         {task.type === 'inking' && (
                            <div className="flex items-center h-10">
                                <Checkbox id="tapeUsed" checked={task.tapeUsed} onCheckedChange={val => handleFieldChange('tapeUsed', val)} />
                                <Label htmlFor="tapeUsed" className="ml-2">Tape Used?</Label>
                            </div>
                         )}
                    </div>
                     <div className="space-y-2">
                        <Label>Description / Notes</Label>
                        <Input value={task.content} onChange={e => handleFieldChange('content', e.target.value)} />
                    </div>
                    
                    {task.type === 'inking' && (
                        <div className="flex items-center space-x-2 pt-4">
                           <Checkbox id="isFinished" checked={task.isFinished} onCheckedChange={val => handleFieldChange('isFinished', val)} />
                           <Label htmlFor="isFinished" className="text-base font-medium">Mark as Finished (applies to whole Tag ID)</Label>
                        </div>
                    )}

                </div>
                <DialogFooter className="sm:justify-between">
                     <Button type="button" variant="destructive" onClick={() => onDelete(task.id)}>
                        <Trash2 className="mr-2 h-4 w-4"/> Delete Task
                    </Button>
                    <DialogClose asChild>
                        <Button type="button">Save Changes</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
