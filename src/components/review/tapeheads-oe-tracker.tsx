
"use client"

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";

export interface OeEntry {
    id: string;
    oeNumber: string;
    sections: number;
    panels: Record<string, number>;
}

interface TapeheadsOeTrackerProps {
    entries: OeEntry[];
    onEntriesChange: (entries: OeEntry[]) => void;
}

const generateSectionIds = (oeNumber: string, sections: number): string[] => {
    if (!oeNumber || oeNumber.length < 3 || sections <= 0) return [];

    const lastThree = oeNumber.slice(-3);
    if (isNaN(parseInt(lastThree))) return [];

    const lastDigit = lastThree.slice(-1);
    const ids = [`00${lastDigit}`];

    for (let i = 0; i < sections - 1; i++) {
        ids.push(`${i + 1}0${lastDigit}`);
    }

    return ids;
};


export function TapeheadsOeTracker({ entries, onEntriesChange }: TapeheadsOeTrackerProps) {

    const addEntry = () => {
        const newEntry: OeEntry = {
            id: `oe_${Date.now()}`,
            oeNumber: "",
            sections: 0,
            panels: {},
        };
        onEntriesChange([...entries, newEntry]);
    };

    const removeEntry = (id: string) => {
        onEntriesChange(entries.filter(entry => entry.id !== id));
    };

    const updateEntry = (id: string, field: keyof OeEntry, value: any) => {
        const updatedEntries = entries.map(entry => {
            if (entry.id === id) {
                 const newEntry = { ...entry, [field]: value };
                 // when sections or oeNumber changes, reset panels
                 if(field === 'sections' || field === 'oeNumber') {
                    newEntry.panels = {};
                 }
                 return newEntry;
            }
            return entry;
        });
        onEntriesChange(updatedEntries);
    };
    
    const updatePanelCount = (entryId: string, sectionId: string, count: number) => {
         const updatedEntries = entries.map(entry => {
            if (entry.id === entryId) {
                return {
                    ...entry,
                    panels: {
                        ...entry.panels,
                        [sectionId]: count,
                    },
                };
            }
            return entry;
        });
        onEntriesChange(updatedEntries);
    }

    return (
        <div className="space-y-4 p-4">
            {entries.map((entry) => (
                <OeEntryCard 
                    key={entry.id} 
                    entry={entry} 
                    onUpdate={updateEntry}
                    onPanelUpdate={updatePanelCount}
                    onRemove={removeEntry}
                />
            ))}
            <Button variant="outline" size="sm" onClick={addEntry}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add OE Entry
            </Button>
        </div>
    );
}


function OeEntryCard({ entry, onUpdate, onPanelUpdate, onRemove }: { entry: OeEntry, onUpdate: (id: string, field: keyof OeEntry, value: any) => void, onPanelUpdate: (entryId: string, sectionId: string, count: number) => void, onRemove: (id: string) => void }) {
    
    const sectionIds = useMemo(() => generateSectionIds(entry.oeNumber, entry.sections), [entry.oeNumber, entry.sections]);
    
    return (
        <Card className="bg-muted/50 p-4 relative">
            <div className="flex items-end gap-4 mb-4">
                <div className="grid gap-1.5 flex-1">
                    <Label htmlFor={`oe-number-${entry.id}`}>OE Number</Label>
                    <Input 
                        id={`oe-number-${entry.id}`}
                        placeholder="e.g., OIT7654-002"
                        value={entry.oeNumber}
                        onChange={(e) => onUpdate(entry.id, 'oeNumber', e.target.value)}
                    />
                </div>
                 <div className="grid gap-1.5">
                    <Label htmlFor={`oe-sections-${entry.id}`}>Number of Sections</Label>
                    <Input
                        id={`oe-sections-${entry.id}`}
                        type="number"
                        value={entry.sections}
                        onChange={(e) => onUpdate(entry.id, 'sections', parseInt(e.target.value, 10) || 0)}
                        className="w-32"
                    />
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onRemove(entry.id)}><Trash2 className="size-4"/></Button>
            </div>
            
            {sectionIds.length > 0 && (
                <div>
                    <Label>Section-Level Panel Counts</Label>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Section ID</TableHead>
                                <TableHead>Panels in Section</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sectionIds.map(sectionId => (
                                <TableRow key={sectionId}>
                                    <TableCell className="font-mono">{sectionId}</TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            placeholder="Enter panel count"
                                            value={entry.panels[sectionId] || ''}
                                            onChange={(e) => onPanelUpdate(entry.id, sectionId, parseInt(e.target.value, 10) || 0)}
                                            className="w-48"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </Card>
    );
}
