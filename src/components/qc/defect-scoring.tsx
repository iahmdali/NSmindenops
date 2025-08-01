
"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const autoDefects = [
    { id: "major_dyneema", label: "Major Dyneema in Tapes", score: 61 },
    { id: "discolored_panel", label: "Discolored Panel", score: 61 },
    { id: "over_cooked", label: "Over-Cooked (Melted Dyneema)", score: 61 },
    { id: "pocket_installation", label: "Pocket Installation", score: 61 },
    { id: "corners_not_laminated", label: "Corners Not Laminated", score: 61 },
    { id: "no_overlap", label: "No Overlap in Scarf Joint", score: 61 },
    { id: "major_glue_line", label: "Major Glue Line", score: 61 },
    { id: "pockets_shrinkage_waves", label: "Pockets Shrinkage Waves", score: 61 },
    { id: "major_shrinkage_waves", label: "Major Shrinkage Waves", score: 61 },
    { id: "all_temp_stickers", label: "All Temp Stickers Not Up to Temp", score: 61 },
    { id: "debris", label: "Debris", score: 61 },
    { id: "exposed_internal", label: "Exposed Internal", score: 61 },
    { id: "gaps_in_external", label: "Gaps in External Tapes", score: 61 },
    { id: "z_fold", label: "Z-Fold", score: 61 },
];

const structuralDefects = [
    { id: "vertical_creases", label: "Vertical Creases", maxEntries: 6 },
    { id: "horizontal_creases", label: "Horizontal Creases", maxEntries: 6 },
    { id: "minor_shrinkage_waves", label: "Minor Shrinkage Waves", maxEntries: 6 },
    { id: "bunched_up_internal_tape", label: "Bunched Up Internal Tape", maxEntries: 6 },
];

const cosmeticDefects = [
    { id: "tint_glue_spots", label: "Tint/Glue Spots", maxEntries: 6 },
    { id: "minor_glue_lines", label: "Minor Glue Lines", maxEntries: 6 },
    { id: "dominant_dyneema", label: "4 or More Dominant Dyneema", maxEntries: 6 },
    { id: "folded_over_external_tape", label: "Folded Over External Tape", maxEntries: 6 },
    { id: "fin", label: "Fin", maxEntries: 6 },
    { id: "bunched_up_external_tape", label: "Bunched Up External Tape", maxEntries: 6 },
    { id: "carbon_fray_glob", label: "Carbon Fray Glob", maxEntries: 6 },
    { id: "tape_spacing", label: "Tape Spacing", maxEntries: 6 },
    { id: "yarn_twists", label: "4 or More Yarn Twists in 1 Panel", maxEntries: 6 },
    { id: "external_splices", label: "3 or More External Splices", maxEntries: 6 },
    { id: "folded_white_external", label: "Folded White External", maxEntries: 6 },
    { id: "bad_patch", label: "Bad Patch", maxEntries: 6 },
    { id: "displaced_pc", label: "Displaced PC", maxEntries: 6 },
];

const severityOptions = ["0", "3", "5", "10", "20"];

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

function SeverityInputs({ category, defectId, maxEntries }: { category: string, defectId: string, maxEntries: number }) {
    const { control } = useFormContext();
    return (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[...Array(maxEntries)].map((_, i) => (
                <FormField
                    key={i}
                    control={control}
                    name={`defects.${category}.${defectId}.${i}`}
                    render={({ field }) => (
                        <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "0"}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {severityOptions.map(opt => <SelectItem key={opt} value={opt}>{opt === "0" ? "-" : opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
            ))}
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
        <TooltipProvider>
        <Accordion type="multiple" className="w-full space-y-4" defaultValue={["A. Lamination / Automatic Second QC Defects"]}>
          <DefectCategory
            title="A. Lamination / Automatic Second QC Defects"
            description="Selecting any of these defects automatically adds 61 points, likely requiring reinspection."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {autoDefects.map(({ id, label }) => (
                     <FormField key={id} control={control} name={`defects.auto.${id}`} render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <FormLabel>{label}</FormLabel>
                        </FormItem>
                     )}/>
                ))}
            </div>
          </DefectCategory>

          <DefectCategory
            title="B. Structural Defects"
            description="For each defect type, enter the severity score (3, 5, 10, or 20) for up to 6 occurrences."
          >
            <div className="space-y-4">
            {structuralDefects.map(({ id, label, maxEntries }) => (
                <div key={id}>
                    <FormLabel className="font-medium">{label}</FormLabel>
                    <SeverityInputs category="structural" defectId={id} maxEntries={maxEntries} />
                </div>
            ))}
            </div>
          </DefectCategory>

          <DefectCategory
            title="C. Cosmetic Defects"
            description="For each defect type, enter the severity score (3, 5, 10, or 20) for up to 6 occurrences."
          >
             <div className="space-y-4">
            {cosmeticDefects.map(({ id, label, maxEntries }) => (
                <div key={id}>
                    <FormLabel className="font-medium">{label}</FormLabel>
                    <SeverityInputs category="cosmetic" defectId={id} maxEntries={maxEntries} />
                </div>
            ))}
            </div>
          </DefectCategory>
        </Accordion>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
