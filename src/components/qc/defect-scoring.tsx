
"use client";

import React, { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "../ui/button";
import { PlusCircle, X } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const autoDefects = [
    { id: "major_dyneema", label: "Major Dyneema in Tapes" },
    { id: "discolored_panel", label: "Discolored Panel" },
    { id: "over_cooked", label: "Over-Cooked (Melted Dyneema)" },
    { id: "pocket_installation", label: "Pocket Installation" },
    { id: "corners_not_laminated", label: "Corners Not Laminated" },
    { id: "no_overlap", label: "No Overlap in Scarf Joint" },
    { id: "major_glue_line", label: "Major Glue Line" },
    { id: "pockets_shrinkage_waves", label: "Pockets Shrinkage Waves" },
    { id: "major_shrinkage_waves", label: "Major Shrinkage Waves" },
    { id: "all_temp_stickers", label: "All Temp Stickers Not Up to Temp" },
    { id: "debris", label: "Debris" },
    { id: "exposed_internal", label: "Exposed Internal" },
    { id: "gaps_in_external", label: "Gaps in External Tapes" },
    { id: "z_fold", label: "Z-Fold" },
];

const structuralDefects = [
    { id: "vertical_creases", label: "Vertical Creases" },
    { id: "horizontal_creases", label: "Horizontal Creases" },
    { id: "minor_shrinkage_waves", label: "Minor Shrinkage Waves" },
    { id: "bunched_up_internal_tape", label: "Bunched Up Internal Tape" },
];

const cosmeticDefects = [
    { id: "tint_glue_spots", label: "Tint/Glue Spots" },
    { id: "minor_glue_lines", label: "Minor Glue Lines" },
    { id: "dominant_dyneema", label: "4 or More Dominant Dyneema" },
    { id: "folded_over_external_tape", label: "Folded Over External Tape" },
    { id: "fin", label: "Fin" },
    { id: "bunched_up_external_tape", label: "Bunched Up External Tape" },
    { id: "carbon_fray_glob", label: "Carbon Fray Glob" },
    { id: "tape_spacing", label: "Tape Spacing" },
    { id: "yarn_twists", label: "4 or More Yarn Twists in 1 Panel" },
    { id: "external_splices", label: "3 or More External Splices" },
    { id: "folded_white_external", label: "Folded White External" },
    { id: "bad_patch", label: "Bad Patch" },
    { id: "displaced_pc", label: "Displaced PC" },
];

const severityOptions = ["3", "5", "10", "20"];

function DefectCategory({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <AccordionItem value={title}>
            <AccordionTrigger className="text-lg font-semibold text-primary">{title}</AccordionTrigger>
            <AccordionContent className="p-1 space-y-4">
                <p className="text-muted-foreground">{description}</p>
                {children}
            </AccordionContent>
        </AccordionItem>
    );
}

function AddDefectDialog({ onAddSeverity, children }: { onAddSeverity: (severity: number) => void, children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState("");

    const handleAdd = () => {
        if (severity) {
            onAddSeverity(parseInt(severity, 10));
            setSeverity("");
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle>Add Defect Severity</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Select value={severity} onValueChange={setSeverity}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select severity score..." />
                        </SelectTrigger>
                        <SelectContent>
                            {severityOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button onClick={handleAdd} disabled={!severity}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function DefectEntry({ category, defect }: { category: 'structural' | 'cosmetic', defect: { id: string, label: string } }) {
    const { control } = useFormContext();
    const name = `defects.${category}.${defect.id}`;
    const { fields, append, remove } = useFieldArray({ control, name });

    const handleAdd = (severity: number) => {
        if (fields.length < 6) {
            append(severity);
        }
    }

    return (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <span className="font-medium text-sm">{defect.label}</span>
            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    {fields.map((field, index) => (
                        <Badge key={field.id} variant="secondary" className="relative group pr-4">
                            {(field as any).value || field}
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="absolute -top-1 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
                {fields.length < 6 && (
                     <AddDefectDialog onAddSeverity={handleAdd}>
                        <Button type="button" size="sm" variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add
                        </Button>
                    </AddDefectDialog>
                )}
            </div>
        </div>
    )
}


export function DefectScoring() {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Defect Scoring System</CardTitle>
        <CardDescription>Record all observed defects. The total score will update automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-4" defaultValue={["A. Lamination / Automatic Defects"]}>
          <DefectCategory
            title="A. Lamination / Automatic Defects"
            description="Selecting any of these defects automatically adds 61 points, likely requiring reinspection."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                {autoDefects.map(({ id, label }) => (
                     <FormField key={id} control={control} name={`defects.auto.${id}`} render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl><Checkbox checked={!!field.value} onCheckedChange={field.onChange} /></FormControl>
                            <FormLabel className="font-normal">{label}</FormLabel>
                        </FormItem>
                     )}/>
                ))}
            </div>
          </DefectCategory>

          <DefectCategory
            title="B. Structural Defects"
            description="For each defect type, click 'Add' to record a severity score for an occurrence."
          >
            <div className="space-y-3">
            {structuralDefects.map((defect) => (
                <DefectEntry key={defect.id} category="structural" defect={defect} />
            ))}
            </div>
          </DefectCategory>

          <DefectCategory
            title="C. Cosmetic Defects"
            description="For each defect type, click 'Add' to record a severity score for an occurrence."
          >
             <div className="space-y-3">
            {cosmeticDefects.map((defect) => (
                <DefectEntry key={defect.id} category="cosmetic" defect={defect} />
            ))}
            </div>
          </DefectCategory>
        </Accordion>
      </CardContent>
    </Card>
  );
}
