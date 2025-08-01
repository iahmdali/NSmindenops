
"use client"

import { useFormContext, useFieldArray } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PlusCircle, Trash2, Info } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { defectCategories, defectDefinitions } from "@/lib/qc-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import React from 'react';
import { Badge } from "../ui/badge";

const DefectInfo = ({ defectKey }: { defectKey: string }) => {
  const definition = defectDefinitions[defectKey as keyof typeof defectDefinitions];
  if (!definition) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
            <Info className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const AddSeverityDialog = ({ onAdd }: { onAdd: (severity: number) => void }) => {
    const [severity, setSeverity] = React.useState(0);
    const [open, setOpen] = React.useState(false);

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
            <DialogContent className="sm:max-w-xs">
                 <DialogHeader><DialogTitle>Add Severity Score</DialogTitle></DialogHeader>
                 <div className="py-4">
                    <Select onValueChange={(val) => setSeverity(Number(val))}>
                        <SelectTrigger><SelectValue placeholder="Select severity..."/></SelectTrigger>
                        <SelectContent>
                            {[...Array(11).keys()].map(i => <SelectItem key={i} value={String(i)}>{i}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="button" onClick={handleAdd}>Add</Button>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export function DefectScoring({ control }: { control: any }) {
  const { setValue } = useFormContext();

  return (
    <Accordion type="multiple" defaultValue={["lamination"]} className="w-full">
      {defectCategories.map((category) => (
        <AccordionItem key={category.id} value={category.id}>
          <AccordionTrigger className="text-xl font-bold font-headline text-primary">
            {category.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {category.defects.map((defect) => (
              <div key={defect.key} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center">
                  {category.type === 'automatic' ? (
                    <FormField
                      control={control}
                      name={`defects.lamination.${defect.key}`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal text-base">{defect.label}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ) : (
                     <p className="font-medium text-base">{defect.label}</p>
                  )}
                   <DefectInfo defectKey={defect.key} />
                </div>

                {category.type !== 'automatic' && (
                  <DefectArrayField control={control} categoryId={category.id} defectKey={defect.key} />
                )}
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}


const DefectArrayField = ({ control, categoryId, defectKey }: { control: any, categoryId: string, defectKey: string }) => {
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
                        {/* This assumes the field is an object with a severity property */}
                        {(field as any).severity}
                        <button type="button" onClick={() => remove(index)} className="ml-2 text-destructive hover:text-red-400">
                           <Trash2 className="h-3 w-3"/>
                        </button>
                    </Badge>
                ))}
            </div>
            <AddSeverityDialog onAdd={handleAddSeverity} />
        </div>
    );
};
