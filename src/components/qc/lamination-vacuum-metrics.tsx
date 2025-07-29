
"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ImageUpload } from "../image-upload";
import { Textarea } from "../ui/textarea";

function TemperatureFields({ side }: { side?: 'Port' | 'Starboard' }) {
  const { control } = useFormContext();
  const namePrefix = side ? `lamination_temps.${side.toLowerCase()}` : "lamination_temps.single";

  return (
    <div className="p-4 border rounded-md space-y-4 bg-muted/30">
        {side && <h4 className="font-semibold">{side} Side</h4>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField control={control} name={`${namePrefix}.head`} render={({ field }) => (<FormItem><FormLabel>Head (°C)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
            <FormField control={control} name={`${namePrefix}.tack`} render={({ field }) => (<FormItem><FormLabel>Tack (°C)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
            <FormField control={control} name={`${namePrefix}.clew`} render={({ field }) => (<FormItem><FormLabel>Clew (°C)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
            <FormField control={control} name={`${namePrefix}.belly`} render={({ field }) => (<FormItem><FormLabel>Belly (°C)</FormLabel><FormControl><Input placeholder="min-max" {...field} /></FormControl></FormItem>)} />
        </div>
    </div>
  );
}


function VacuumFields({ stage }: { stage: 'before' | 'after' }) {
    const { control } = useFormContext();
    const namePrefix = `vacuum_${stage}`;
    const title = stage === 'before' ? 'Before Lamination' : 'After Lamination';
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-5 gap-x-4 gap-y-2">
                {[...Array(10)].map((_, i) => (
                    <FormField
                        key={i}
                        control={control}
                        name={`${namePrefix}[${i}]`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{i + 1}</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value ?? ''} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                ))}
            </CardContent>
        </Card>
    );
}

export function LaminationVacuumMetrics() {
  const { control, watch } = useFormContext();
  const dpiType = watch("dpi_type");

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. DPI-Based Lamination & Vacuum Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="dpi_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>DPI Type Selection</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex items-center space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="<50000" /></FormControl>
                    <FormLabel className="font-normal">&lt; 50,000</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value=">50000" /></FormControl>
                    <FormLabel className="font-normal">&gt; 50,000</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
            <h3 className="text-md font-medium">Lamination Temperatures</h3>
            {dpiType === '>50000' ? (
                <div className="space-y-4">
                    <TemperatureFields side="Port" />
                    <TemperatureFields side="Starboard" />
                </div>
            ) : (
                <TemperatureFields />
            )}
        </div>

        <div className="space-y-4">
             <h3 className="text-md font-medium">Vacuum Gauge Readings</h3>
             <div className="grid md:grid-cols-2 gap-4">
                <VacuumFields stage="before" />
                <VacuumFields stage="after" />
             </div>
        </div>

         <div className="space-y-4">
             <h3 className="text-md font-medium">Comments & Attachments</h3>
             <FormField control={control} name="qc_comments" render={({ field }) => (
                <FormItem>
                    <FormLabel>QC Comments</FormLabel>
                    <FormControl><Textarea placeholder="Enter notes, observations, anomalies, etc." {...field} /></FormControl>
                </FormItem>
             )}/>
             <FormField control={control} name="attachments" render={({ field }) => (
                <FormItem>
                    <FormLabel>Attachment Upload</FormLabel>
                    <FormControl><ImageUpload value={field.value} onChange={field.onChange} /></FormControl>
                </FormItem>
             )} />
         </div>

      </CardContent>
    </Card>
  );
}
