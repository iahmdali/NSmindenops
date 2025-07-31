
"use client";

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addOeJob } from '@/lib/oe-data';
import { PlusCircle, Trash2 } from 'lucide-react';

const sectionSchema = z.object({
  sectionId: z.string().min(1, 'Section ID is required.').length(3, 'Must be 3 digits.'),
  panels: z.coerce.number().min(1, 'At least one panel is required.'),
});

const oeTrackerSchema = z.object({
  oeBase: z.string().min(1, 'OE Base is required.'),
  sections: z.array(sectionSchema).min(1, 'At least one section must be added.'),
});

type OeTrackerFormValues = z.infer<typeof oeTrackerSchema>;

export function OeTracker() {
  const { toast } = useToast();

  const form = useForm<OeTrackerFormValues>({
    resolver: zodResolver(oeTrackerSchema),
    defaultValues: {
      oeBase: '',
      sections: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'sections',
  });
  
  const onSubmit = (data: OeTrackerFormValues) => {
    addOeJob(data);
    
    toast({
      title: 'OE Job Initialized',
      description: `${data.oeBase} with ${data.sections.length} sections has been created.`,
    });
    form.reset();
    replace([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OE & Section Initialization</CardTitle>
        <CardDescription>
          Register a new OE job and add its sections incrementally.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="oeBase"
              render={({ field }) => (
                <FormItem className="max-w-sm">
                  <FormLabel>OE Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., OAUS32162" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <FormLabel className="text-base font-medium">Job Sections</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ sectionId: '', panels: 1 })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
              
              {fields.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-6">
                  No sections added yet.
                </div>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md bg-muted/30">
                   <div className='flex items-end gap-2 flex-1'>
                      <div className="font-medium text-muted-foreground text-sm self-center pb-2">
                        {form.getValues('oeBase') || 'OE...'} -
                      </div>
                      <FormField
                          control={form.control}
                          name={`sections.${index}.sectionId`}
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Section ID</FormLabel>
                              <FormControl>
                              <Input placeholder="e.g., 001" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                   </div>

                  <FormField
                    control={form.control}
                    name={`sections.${index}.panels`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Panels</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min="1"/>
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
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
