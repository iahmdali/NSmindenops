
"use client"

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { ImageUpload } from "../image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function DefectPictures() {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Defect Picture Uploads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="defectPictures.port"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Port Side</FormLabel>
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
        <FormField
          control={control}
          name="defectPictures.starboard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Starboard Side</FormLabel>
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
        <FormField
          control={control}
          name="defectPictures.structural"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Structural Defects</FormLabel>
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
      </CardContent>
    </Card>
  );
}
