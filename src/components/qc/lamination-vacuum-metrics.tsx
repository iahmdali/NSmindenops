
"use client"

import React from 'react';
import { useFormContext, useWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ImageUpload } from "../image-upload";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const TemperatureFields = ({ side }: { side: 'single' | 'port' | 'starboard' }) => {
  const { control } = useFormContext();
  const namePrefix = side === 'single' ? 'laminationTemp.single' : `laminationTemp.${side}`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
      <FormField
        control={control}
        name={`${namePrefix}.head`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Head (°C)</FormLabel>
            <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${namePrefix}.tack`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tack (°C)</FormLabel>
            <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${namePrefix}.clew`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Clew (°C)</FormLabel>
            <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex items-end gap-2">
        <FormField
          control={control}
          name={`${namePrefix}.belly_min`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Belly Min (°C)</FormLabel>
              <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={control}
          name={`${namePrefix}.belly_max`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Belly Max (°C)</FormLabel>
              <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export function LaminationVacuumMetrics() {
  const { control } = useFormContext();
  const dpiType = useWatch({ control, name: "dpiType" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>DPI-Based Lamination and Vacuum Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="dpiType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DPI Type Selection</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6 pt-2">
                  <FormItem className="flex items-center space-x-2">
                    <FormControl><RadioGroupItem value="<50000" /></FormControl>
                    <FormLabel className="font-normal">&lt; 50,000 DPI</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl><RadioGroupItem value=">50000" /></FormControl>
                    <FormLabel className="font-normal">&gt; 50,000 DPI</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
            <h3 className="text-base font-semibold mb-2">Lamination Temperature Input</h3>
            {dpiType === '<50000' ? (
                <TemperatureFields side="single" />
            ) : (
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium mb-2">Port Side</h4>
                        <TemperatureFields side="port" />
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Starboard Side</h4>
                        <TemperatureFields side="starboard" />
                    </div>
                </div>
            )}
        </div>
        
        <div>
            <h3 className="text-base font-semibold mb-2">Vacuum Gauge Readings</h3>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-24">Gauge #</TableHead>
                             {Array.from({ length: 10 }).map((_, i) => (
                                <TableHead key={i} className="text-center">{i + 1}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Before Lamination</TableCell>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <TableCell key={i}>
                                     <FormField
                                        control={control}
                                        name={`vacuumReadings.before.${i}`}
                                        render={({ field }) => (
                                            <FormControl><Input type="number" className="min-w-[60px] text-center" {...field} value={field.value ?? ''} /></FormControl>
                                        )}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                         <TableRow>
                            <TableCell className="font-medium">After Lamination</TableCell>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <TableCell key={i}>
                                     <FormField
                                        control={control}
                                        name={`vacuumReadings.after.${i}`}
                                        render={({ field }) => (
                                            <FormControl><Input type="number" className="min-w-[60px] text-center" {...field} value={field.value ?? ''} /></FormControl>
                                        )}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
        
        <div className="space-y-4">
             <FormField
              control={control}
              name="qcComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>QC Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any free-text observations or notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachment Upload</FormLabel>
                  <FormControl>
                    <ImageUpload 
                        value={field.value} 
                        onChange={field.onChange} 
                        maxFiles={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

      </CardContent>
    </Card>
  );
}

    