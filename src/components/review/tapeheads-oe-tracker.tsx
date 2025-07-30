
"use client"

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Edit, Check } from "lucide-react";

export interface OeEntry {
    id: string;
    oeNumber: string;
    totalSections: number;
    sections: { id: string; panels: number }[];
}

interface TapeheadsOeTrackerProps {
    entries: OeEntry[];
    onEntriesChange: (entries: OeEntry[]) => void;
}


const generateSectionIds = (oeNumber: string, totalSections: number): { id: string, panels: number }[] => {
    if (!oeNumber || totalSections <= 0) return [];
    
    const oeBaseMatch = oeNumber.match(/^([A-Z]+[0-9]+)/);
    if (!oeBaseMatch) return [];
    
    const oeBase = oeBaseMatch[1];
    const existingSailNumbers = new Set<string>(); // In a real app, this would come from a DB query

    // Find the next available sail number prefix (0xx, 2xx, 4xx)
    let sailNumPrefix = 0;
    while(existingSailNumbers.has(`${oeBase}-${String(sailNumPrefix).padStart(1,'0')}01`)) {
        sailNumPrefix += 2;
    }

    const ids: { id: string, panels: number }[] = [];

    // Head panel
    ids.push({ id: `${oeBase}-${String(sailNumPrefix)}01`, panels: 0 });

    // Subsequent sections
    for (let i = 1; i < totalSections; i++) {
        const panelSequence = i * 10;
        ids.push({ id: `${oeBase}-${panelSequence + sailNumPrefix}1`, panels: 0 });
    }

    return ids;
};


export function TapeheadsOeTracker({ entries, onEntriesChange }: TapeheadsOeTrackerProps) {

    const addEntry = () => {
        const newEntry: OeEntry = {
            id: `oe_${Date.now()}`,
            oeNumber: "",
            totalSections: 0,
            sections: [],
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
                 if(field === 'oeNumber' || field === 'totalSections') {
                    newEntry.sections = generateSectionIds(newEntry.oeNumber, newEntry.totalSections);
                 }
                 return newEntry;
            }
            return entry;
        });
        onEntriesChange(updatedEntries);
    };

    const updateSection = (entryId: string, sectionId: string, updatedValues: { id?: string, panels?: number }) => {
        onEntriesChange(entries.map(entry => {
            if (entry.id === entryId) {
                return {
                    ...entry,
                    sections: entry.sections.map(section => 
                        section.id === sectionId ? { ...section, ...updatedValues } : section
                    ),
                };
            }
            return entry;
        }));
    };

    return (
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            {entries.map((entry) => (
                <OeEntryCard 
                    key={entry.id} 
                    entry={entry} 
                    onUpdate={updateEntry}
                    onSectionUpdate={updateSection}
                    onRemove={removeEntry}
                />
            ))}
            <Button variant="outline" size="sm" onClick={addEntry}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New OE Job
            </Button>
        </div>
    );
}


function OeEntryCard({ 
    entry, 
    onUpdate, 
    onSectionUpdate,
    onRemove 
}: { 
    entry: OeEntry, 
    onUpdate: (id: string, field: keyof OeEntry, value: any) => void, 
    onSectionUpdate: (entryId: string, sectionId: string, updatedValues: { id?: string, panels?: number }) => void, 
    onRemove: (id: string) => void 
}) {
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editableId, setEditableId] = useState('');
    
    const handleEdit = (sectionId: string) => {
        setEditableId(sectionId);
        setIsEditing(sectionId);
    };
    
    const handleSave = (sectionId: string) => {
        onSectionUpdate(entry.id, sectionId, { id: editableId });
        setIsEditing(null);
    };


    return (
        <Card className="bg-background p-4 relative">
             <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => onRemove(entry.id)}><Trash2 className="size-4"/></Button>
            <div className="flex items-end gap-4 mb-4">
                 <div className="grid gap-1.5 flex-1">
                    <Label htmlFor={`oe-number-${entry.id}`}>OE Number (e.g., OAUS32162)</Label>
                    <Input 
                        id={`oe-number-${entry.id}`}
                        placeholder="Enter OE Base..."
                        value={entry.oeNumber}
                        onChange={(e) => onUpdate(entry.id, 'oeNumber', e.target.value)}
                    />
                </div>
                 <div className="grid gap-1.5">
                    <Label htmlFor={`oe-sections-${entry.id}`}>Total Sections</Label>
                    <Input
                        id={`oe-sections-${entry.id}`}
                        type="number"
                        value={entry.totalSections}
                        onChange={(e) => onUpdate(entry.id, 'totalSections', parseInt(e.target.value, 10) || 0)}
                        className="w-32"
                    />
                </div>
            </div>
            
            {entry.sections.length > 0 && (
                <div>
                    <Label className="text-sm font-medium">Generated Sections</Label>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Section Code</TableHead>
                                <TableHead>Number of Panels</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entry.sections.map(section => (
                                <TableRow key={section.id}>
                                    <TableCell>
                                        {isEditing === section.id ? (
                                            <Input 
                                                value={editableId} 
                                                onChange={(e) => setEditableId(e.target.value)}
                                                className="font-mono h-8"
                                            />
                                        ) : (
                                            <span className="font-mono">{section.id}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={section.panels}
                                            onChange={(e) => onSectionUpdate(entry.id, section.id, { panels: parseInt(e.target.value) || 0 })}
                                            className="w-32 h-8"
                                        />
                                    </TableCell>
                                     <TableCell className="text-right">
                                        {isEditing === section.id ? (
                                            <Button size="sm" variant="outline" onClick={() => handleSave(section.id)}>
                                                <Check className="size-4"/>
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="ghost" onClick={() => handleEdit(section.id)}>
                                               <Edit className="size-4"/>
                                            </Button>
                                        )}
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
