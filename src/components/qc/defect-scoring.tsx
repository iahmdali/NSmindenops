
"use client"

import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { PlusCircle, Trash2, Info } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { defectCategories, defectDefinitions } from "@/lib/qc-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import React from 'react';
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";

const DefectInfoDialog = ({ defectKey, label }: { defectKey: string, label: string }) => {
  const definition = defectDefinitions[defectKey as keyof typeof defectDefinitions];
  if (!definition) return null;

  return (
    <Dialog>
        <DialogTrigger asChild>
             <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                <Info className="h-4 w-4" />
             </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{label}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <p>{definition}</p>
            </div>
            <DialogFooter>
                 <DialogClose asChild><Button>Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};

const AddSeverityDialog = ({ onAdd, defectKey }: { onAdd: (severity: number) => void, defectKey: string }) => {
    const [severity, setSeverity] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const definition = defectDefinitions[defectKey as keyof typeof defectDefinitions];

    const handleAdd = () => {
        onAdd(severity);
        setSeverity(0);
        setOpen(false);
    }
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Entry</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                 <DialogHeader>
                    <DialogTitle>Add Severity Score</DialogTitle>
                    {definition && <p className="text-sm text-muted-foreground pt-2">{definition}</p>}
                 </DialogHeader>
                 <div className="py-4">
                    <Label>Severity</Label>
                    <Select onValueChange={(val) => setSeverity(Number(val))}>
                        <SelectTrigger><SelectValue placeholder="Select severity..."/></SelectTrigger>
                        <SelectContent>
                            {[...Array(11).keys()].map(i => <SelectItem key={i} value={String(i)}>{i}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="button" onClick={handleAdd}>Add Score</Button>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export function DefectScoring({ control }: { control: any }) {

  return (
    <Accordion type="multiple" defaultValue={["lamination"]} className="w-full">
      {defectCategories.map((category) => (
        <AccordionItem key={category.id} value={category.id}>
          <AccordionTrigger className="text-xl font-bold font-headline text-primary">
            {category.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {category.defects.map((defect) => (
              <div key={defect.key}>
                {category.id === 'lamination' ? (
                    <LaminationDefectField control={control} defectKey={defect.key} label={defect.label} />
                ) : (
                    <div className="flex items-center justify-between p-3 border rounded-md">
                         <div className="flex items-center">
                            <p className="font-medium text-base">{defect.label}</p>
                            <DefectInfoDialog defectKey={defect.key} label={defect.label} />
                        </div>
                        <SeverityOnlyDefectField control={control} categoryId={category.id} defectKey={defect.key} />
                    </div>
                )}
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

const SeverityOnlyDefectField = ({ control, categoryId, defectKey }: { control: any, categoryId: string, defectKey: string }) => {
    const fieldName = `defects.${categoryId}.${defectKey}`;
    const { fields, append, remove } = useFieldArray({ control, name: fieldName });

    const handleAddSeverity = (severity: number) => {
        if (fields.length < 6) {
            append({ severity });
        }
    };
    
    return (
        <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-2 justify-end max-w-md">
                 {fields.map((field, index) => (
                    <Badge key={field.id} variant="secondary" className="text-base">
                        {(field as any).severity}
                        <button type="button" onClick={() => remove(index)} className="ml-2 text-destructive hover:text-red-400">
                           <Trash2 className="h-3 w-3"/>
                        </button>
                    </Badge>
                ))}
            </div>
            <AddSeverityDialog onAdd={handleAddSeverity} defectKey={defectKey} />
        </div>
    );
};


const LaminationDefectField = ({ control, defectKey, label }: { control: any, defectKey: string, label: string }) => {
    const fieldName = `defects.lamination.${defectKey}`;
    const isPresent = useWatch({ control, name: `${fieldName}.present` });

    return (
        <div className="p-3 border rounded-md space-y-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <FormField
                        control={control}
                        name={`${fieldName}.present`}
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-medium text-base pt-1">{label}</FormLabel>
                            </FormItem>
                        )}
                    />
                    <DefectInfoDialog defectKey={defectKey} label={label} />
                </div>
            </div>
            {isPresent && (
                 <div className="flex items-start gap-4 p-3 border-t rounded-md bg-background/50 relative">
                    <FormField
                        control={control}
                        name={`${fieldName}.description`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter comprehensive description..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={control}
                        name={`${fieldName}.severity`}
                        render={({ field }) => (
                            <FormItem className="w-32">
                                <FormLabel>Score</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}
        </div>
    );
};
