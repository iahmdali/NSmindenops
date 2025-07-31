
"use client";

import { useState } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addOeJob } from '@/lib/oe-data';
import { PlusCircle, Trash2 } from 'lucide-react';
import { MultiSelect, type MultiSelectOption } from '../ui/multi-select';

const sectionSchema = z.object({
  sectionId: z.string().min(1, 'Sail # is required.').length(3, 'Must be 3 digits.'),
  panels: z.array(z.string()).min(1, 'At least one panel must be assigned.'),
});

const oeTrackerSchema = z.object({
  oeBase: z.string().min(1, 'OE Number is required.'),
  totalPanels: z.coerce.number().min(1, "Total panels must be at least 1."),
  sections: z.array(sectionSchema).min(1, 'At least one sail must be added.'),
});

type OeTrackerFormValues = z.infer<typeof oeTrackerSchema>;

export function OeTracker() {
  const { toast } = useToast();

  const form = useForm<OeTrackerFormValues>({
    resolver: zodResolver(oeTrackerSchema),
    defaultValues: {
      oeBase: '',
      totalPanels: 0,
      sections: [],
    },
  });
  
  const totalPanels = useWatch({ control: form.control, name: 'totalPanels' });
  const assignedPanels = useWatch({ control: form.control, name: 'sections' })
    .flatMap(s => s.panels);

  const panelOptions: MultiSelectOption[] = Array.from({ length: totalPanels || 0 }, (_, i) => ({
    value: `P${i + 1}`,
    label: `P${i + 1}`,
  }));
  
  const availablePanelOptions = panelOptions.filter(p => !assignedPanels.includes(p.value));


  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'sections',
  });
  
  const onSubmit = (data: OeTrackerFormValues) => {
     // In a real app, you'd transform this to match your needed data structure.
    const jobData = {
        oeBase: data.oeBase,
        sections: data.sections.map(s => ({
            sectionId: s.sectionId,
            panels: s.panels.length // Storing the count, but you have the list in `s.panels`
        }))
    };
    
    // The addOeJob function expects a number for panels, so we'll pass the length.
    addOeJob(jobData);
    
    toast({
      title: 'OE Job Initialized',
      description: `Job for ${data.oeBase} has been created with its sections.`,
    });
    form.reset();
    replace([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OE & Sail Initialization</CardTitle>
        <CardDescription>
          Register a new OE, define its total panels, and assign panels to each sail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="oeBase"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>OE Number</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., OAUS32162" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="totalPanels"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Total Number of Panels in this OE</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 25" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <FormLabel className="text-base font-medium">Sails for this OE</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ sectionId: '', panels: [] })}
                  disabled={!totalPanels || totalPanels === 0}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Sail
                </Button>
              </div>
              
              {!totalPanels && (
                 <div className="text-center text-sm text-muted-foreground py-6">
                    Enter the total number of panels to begin assigning them to sails.
                </div>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md bg-muted/30">
                   <div className='flex items-end gap-2 flex-grow'>
                      <div className="font-medium text-muted-foreground text-sm self-center pb-2">
                        {form.getValues('oeBase') || 'OE...'} -
                      </div>
                      <FormField
                          control={form.control}
                          name={`sections.${index}.sectionId`}
                          render={({ field: sectionField }) => (
                          <FormItem className="w-32">
                              <FormLabel>Sail #</FormLabel>
                              <FormControl>
                              <Input placeholder="001" {...sectionField} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                   </div>

                  <FormField
                    control={form.control}
                    name={`sections.${index}.panels`}
                    render={({ field: panelField }) => {
                        // Combine available options with the ones already selected for this specific field
                        const currentOptions = [
                            ...availablePanelOptions,
                            ...panelOptions.filter(p => panelField.value.includes(p.value))
                        ].sort((a,b) => parseInt(a.label.substring(1)) - parseInt(b.label.substring(1)));

                        return (
                          <FormItem className="flex-grow">
                            <FormLabel>Panels for this Sail</FormLabel>
                             <MultiSelect
                                options={currentOptions}
                                selected={panelField.value}
                                onChange={panelField.onChange}
                                placeholder="Select panels..."
                            />
                             <FormMessage />
                          </FormItem>
                        )
                    }}
                  />
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={fields.length === 0}>
                Initialize OE Job
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
