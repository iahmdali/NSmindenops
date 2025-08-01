
"use client"

import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { InspectionMetadata } from './inspection-metadata';
import { LaminationVacuumMetrics } from './lamination-vacuum-metrics';
import { DefectScoring } from './defect-scoring';
import { ReinspectionOutcome } from './reinspection-outcome';
import { NewFoundDefects } from './new-found-defects';
import { DefectPictures } from './defect-pictures';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Card } from '../ui/card';

const temperatureSchema = z.object({
  head: z.coerce.number().optional(),
  tack: z.coerce.number().optional(),
  clew: z.coerce.number().optional(),
  belly_min: z.coerce.number().optional(),
  belly_max: z.coerce.number().optional(),
});

const severityOnlyDefectSchema = z.array(z.object({
  severity: z.coerce.number().min(0).max(10),
})).max(6).optional();

const detailedDefectSchema = z.array(z.object({
  description: z.string().min(1, 'Description is required.'),
  severity: z.coerce.number().min(0).max(10),
})).optional();


const inspectionFormSchema = z.object({
  inspectionDate: z.date(),
  oeNumber: z.string().min(1, 'OE# is required.'),
  inspectorName: z.string().min(1, 'Inspector name is required.'),
  dpiType: z.enum(['<50000', '>50000']),
  laminationTemp: z.object({
    single: temperatureSchema.optional(),
    port: temperatureSchema.optional(),
    starboard: temperatureSchema.optional(),
  }),
  vacuumReadings: z.object({
    before: z.array(z.coerce.number().optional()).length(10),
    after: z.array(z.coerce.number().optional()).length(10),
  }),
  qcComments: z.string().optional(),
  attachments: z.any().optional(),
  
  defects: z.object({
    lamination: z.object({
      majorDyneema: detailedDefectSchema,
      discoloredPanel: detailedDefectSchema,
      overCooked: detailedDefectSchema,
      pocketInstallation: detailedDefectSchema,
      cornersNotLaminated: detailedDefectSchema,
      noOverlapScarfJoint: detailedDefectSchema,
      majorGlueLine: detailedDefectSchema,
      pocketsShrinkageWaves: detailedDefectSchema,
      majorShrinkageWaves: detailedDefectSchema,
      tempStickersNotUpToTemp: detailedDefectSchema,
      debris: detailedDefectSchema,
      exposedInternal: detailedDefectSchema,
      gapsInExternalTapes: detailedDefectSchema,
      zFold: detailedDefectSchema,
    }),
    structural: z.object({
      verticalCreases: severityOnlyDefectSchema,
      horizontalCreases: severityOnlyDefectSchema,
      minorShrinkageWaves: severityOnlyDefectSchema,
      bunchedUpInternalTape: severityOnlyDefectSchema,
    }),
    cosmetic: z.object({
      tintGlueSpots: severityOnlyDefectSchema,
      minorGlueLines: severityOnlyDefectSchema,
      dominantDyneema: severityOnlyDefectSchema,
      foldedOverExternalTape: severityOnlyDefectSchema,
      fin: severityOnlyDefectSchema,
      bunchedUpExternalTape: severityOnlyDefectSchema,
      carbonFrayGlob: severityOnlyDefectSchema,
      tapeSpacing: severityOnlyDefectSchema,
      yarnTwists: severityOnlyDefectSchema,
      externalSplices: severityOnlyDefectSchema,
      foldedWhiteExternal: severityOnlyDefectSchema,
      badPatch: severityOnlyDefectSchema,
      displacedPC: severityOnlyDefectSchema,
    }),
  }),

  reinspection: z.object({
    finalOutcome: z.string().optional(),
    comments: z.string().optional(),
  }).optional(),
  
  newFoundDefects: z.array(z.object({
    panelNumber: z.string().optional(),
    scarfJoint: z.string().optional(),
    numberOfDefects: z.coerce.number().optional(),
    defectScore: z.coerce.number().optional(),
    comments: z.string().optional(),
  })).optional(),
  
  defectPictures: z.object({
    port: z.any().optional(),
    starboard: z.any().optional(),
    structural: z.any().optional(),
  }).optional(),
});

type InspectionFormValues = z.infer<typeof inspectionFormSchema>;

export function ThreeDiInspectionForm() {
  const { toast } = useToast();
  const methods = useForm<InspectionFormValues>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues: {
      inspectionDate: new Date(),
      oeNumber: '',
      inspectorName: '',
      dpiType: '<50000',
      vacuumReadings: {
        before: Array(10).fill(undefined),
        after: Array(10).fill(undefined),
      },
      defects: {
        lamination: {},
        structural: {},
        cosmetic: {},
      },
      newFoundDefects: [],
    },
  });

  const watchedDefects = useWatch({ control: methods.control, name: 'defects' });

  const totalScore = useMemo(() => {
    let score = 0;
    if (!watchedDefects) return 0;
    
    // Lamination defects with description and severity
    if (watchedDefects.lamination) {
        for (const defectKey in watchedDefects.lamination) {
            const entries = watchedDefects.lamination[defectKey as keyof typeof watchedDefects.lamination];
            if (Array.isArray(entries)) {
                score += entries.reduce((sum, entry) => sum + (entry.severity || 0), 0);
            }
        }
    }
    
    // Structural and cosmetic defects with only severity
    const otherCategories: (keyof Omit<typeof watchedDefects, 'lamination'>)[] = ['structural', 'cosmetic'];
    for (const categoryKey of otherCategories) {
        const category = watchedDefects[categoryKey];
        if (category) {
            for (const defectKey in category) {
                const entries = category[defectKey as keyof typeof category];
                 if (Array.isArray(entries)) {
                    score += entries.reduce((sum, entry) => sum + (entry.severity || 0), 0);
                }
            }
        }
    }
    
    return score;
  }, [watchedDefects]);

  const inspectionStatus = useMemo(() => {
    if (totalScore >= 100) return { text: 'Fail', color: 'bg-red-500 text-white' };
    if (totalScore >= 61) return { text: 'Reinspection Required', color: 'bg-yellow-400 text-black' };
    return { text: 'Pass', color: 'bg-green-500 text-white' };
  }, [totalScore]);

  const showReinspection = totalScore >= 61 && totalScore < 100;

  function onSubmit(data: InspectionFormValues) {
    console.log({ ...data, totalScore, status: inspectionStatus.text });
    toast({
      title: 'Inspection Submitted',
      description: `OE# ${data.oeNumber} has been submitted with a score of ${totalScore}.`,
    });
  }

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="sticky top-2 z-10 shadow-lg">
                <div className="p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold font-headline">Total Score: {totalScore}</h2>
                        <Badge className={cn("text-lg", inspectionStatus.color)}>{inspectionStatus.text}</Badge>
                    </div>
                    <Button type="submit" size="lg">Submit Inspection</Button>
                </div>
            </Card>

            <InspectionMetadata />
            <LaminationVacuumMetrics />
            <DefectScoring control={methods.control} />
            {showReinspection && <ReinspectionOutcome />}
            <Separator />
            <NewFoundDefects control={methods.control} />
            <DefectPictures />
        </form>
      </Form>
    </FormProvider>
  );
}
