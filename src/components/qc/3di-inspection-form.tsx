
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { InspectionMetadata } from "./inspection-metadata";
import { LaminationVacuumMetrics } from "./lamination-vacuum-metrics";
import { DefectScoring } from "./defect-scoring";
import { ReinspectionOutcome } from "./reinspection-outcome";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";

// Define the schema for the entire form
const inspectionSchema = z.object({
  inspection_date: z.date(),
  oe_number: z.string().min(1, "OE# is required."),
  inspector_name: z.string().min(1, "Inspector name is required."),
  dpi_type: z.enum(["<50000", ">50000"]),
  lamination_temps: z.any(), // Simplified for now, can be detailed later
  vacuum_before: z.array(z.coerce.number().optional()),
  vacuum_after: z.array(z.coerce.number().optional()),
  qc_comments: z.string().optional(),
  attachments: z.any().optional(),
  defects: z.any(), // Will be detailed in the defect component
  reinspection_notes: z.string().optional(),
});

type InspectionFormValues = z.infer<typeof inspectionSchema>;

export function ThreeDiInspectionForm() {
  const { toast } = useToast();
  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      inspection_date: new Date(),
      oe_number: "",
      inspector_name: "",
      dpi_type: "<50000",
      vacuum_before: Array(10).fill(undefined),
      vacuum_after: Array(10).fill(undefined),
      defects: {},
    },
  });
  
  const defects = form.watch("defects");

  const calculateTotalScore = () => {
    let total = 0;
    if (!defects) return 0;
    
    // Automatic defects
    if (defects.auto) {
        Object.values(defects.auto).forEach((value: any) => {
            if (value) total += 61;
        });
    }
    // Structural and Cosmetic defects
    ['structural', 'cosmetic'].forEach(category => {
        if(defects[category]) {
            Object.values(defects[category]).forEach((defect: any) => {
                if(defect) {
                    Object.values(defect).forEach((severity: any) => {
                        if (severity) total += parseInt(severity, 10);
                    });
                }
            });
        }
    });

    return total;
  };
  
  const totalScore = calculateTotalScore();

  const getStatus = (): { text: string; className: string } => {
    if (totalScore >= 100) return { text: "Fail", className: "bg-red-100 text-red-800 border-red-500" };
    if (totalScore >= 61) return { text: "Requires Reinspection", className: "bg-yellow-100 text-yellow-800 border-yellow-500" };
    return { text: "Pass", className: "bg-green-100 text-green-800 border-green-500" };
  };

  const status = getStatus();


  function onSubmit(values: InspectionFormValues) {
    console.log({ ...values, totalScore, status: status.text });
    toast({
      title: "Inspection Report Submitted!",
      description: `OE# ${values.oe_number} has been submitted with a score of ${totalScore} (${status.text}).`,
    });
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Inspection Details</CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Live Score</p>
                                <p className="text-2xl font-bold">{totalScore}</p>
                            </div>
                            <div className={`text-center p-2 px-4 rounded-md border-2 font-bold ${status.className}`}>
                                {status.text}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>

        <InspectionMetadata />
        <LaminationVacuumMetrics />
        <DefectScoring />
        <ReinspectionOutcome isVisible={totalScore >= 61 && totalScore < 100} />
        
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg">Submit Inspection Report</Button>
        </div>
      </form>
    </FormProvider>
  );
}
