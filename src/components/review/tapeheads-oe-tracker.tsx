
"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { addOeJob } from '@/lib/oe-data';

const sectionSchema = z.object({
  id: z.string(),
  sectionId: z.string().min(1, 'Suffix is required.').length(3, 'Must be 3 digits.'),
  panels: z.coerce.number().min(1, 'At least one panel is required.'),
});

const oeTrackerSchema = z.object({
  oeBase: z.string().min(1, 'OE Base is required.'),
  sections: z.array(sectionSchema).min(1, 'At least one section is required.'),
});

type OeTrackerFormValues = z.infer<typeof oeTrackerSchema>;

export function TapeheadsOeTracker() {
  const { toast } = useToast();
  const [totalSections, setTotalSections] = useState(1);

  const form = useForm<OeTrackerFormValues>({
    resolver: zodResolver(oeTrackerSchema),
    defaultValues: {
      oeBase: '',
      sections: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'sections',
  });

  const generateSections = () => {
    const oeBase = form.getValues('oeBase');
    if (!oeBase) {
      toast({
        title: 'OE Base Required',
        description: 'Please enter an OE Base number before generating sections.',
        variant: 'destructive',
      });
      return;
    }
    
    const newSections = Array.from({ length: totalSections }, (_, i) => {
        let sectionId;
        if (i === 0) sectionId = '001';
        else if (i > 0 && i < 10) sectionId = `10${i}`;
        else {
             const lastDigit = ((i-9) % 10).toString();
             const middleDigit = Math.floor((i-9) / 10).toString();
            sectionId = `1${middleDigit}${lastDigit}`.slice(0, 3).padStart(3, '1');
        }

        return {
            id: `section-${Date.now()}-${i}`,
            sectionId,
            panels: 1,
        };
    });
    replace(newSections);
  };
  

  const onSubmit = (data: OeTrackerFormValues) => {
    // Add the newly created job to our mock data store
    addOeJob(data);
    
    console.log("Job created:", data);

    toast({
      title: 'OE Job Initialized',
      description: `${data.oeBase} with ${data.sections.length} sections has been created.`,
    });
    form.reset();
    replace([]);
    setTotalSections(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>File System Module – OE & Section Initialization</CardTitle>
        <CardDescription>
          Register a new OE job and define its sections for the Tapeheads department.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-end gap-4">
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
              <FormItem>
                <FormLabel>Total Sections</FormLabel>
                <Input
                  type="number"
                  value={totalSections}
                  onChange={(e) => setTotalSections(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  min="1"
                />
              </FormItem>
              <Button type="button" onClick={generateSections}>
                Generate Sections
              </Button>
            </div>

            {fields.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <FormLabel className="text-base font-medium">Generated Sections</FormLabel>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md bg-muted/30">
                     <div className='flex items-end gap-2 flex-1'>
                        <FormField
                            control={form.control}
                            name={`oeBase`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>OE Base</FormLabel>
                                <FormControl>
                                <Input {...field} disabled />
                                </FormControl>
                            </FormItem>
                            )}
                        />
                        <span className='mb-2'>-</span>
                        <FormField
                            control={form.control}
                            name={`sections.${index}.sectionId`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Section ID</FormLabel>
                                <FormControl>
                                <Input {...field} />
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
                  </div>
                ))}
              </div>
            )}

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
