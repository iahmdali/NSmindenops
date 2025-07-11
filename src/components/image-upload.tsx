
"use client"

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface ImageUploadProps {
  value?: (File | string)[];
  onChange: (files: (File | string)[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
}: ImageUploadProps) {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        fileRejections.forEach(({ errors }) => {
          errors.forEach((error: any) => {
            toast({
              title: "Upload Error",
              description: error.message,
              variant: "destructive",
            });
          });
        });
        return;
      }

      const newFiles = acceptedFiles.slice(0, maxFiles - value.length);
      const updatedFiles = [...value, ...newFiles];
      onChange(updatedFiles);

      // Simulate upload progress
      newFiles.forEach(file => {
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = (prev[file.name] || 0) + 10;
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              return { ...prev, [file.name]: 100 };
            }
            return { ...prev, [file.name]: newProgress };
          });
        }, 200);
      });
    },
    [value, onChange, maxFiles, maxSize, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize,
    maxFiles,
    disabled: value.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    const updatedFiles = value.filter((_, i) => i !== index);
    onChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
        } ${value.length >= maxFiles ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {isDragActive ? 'Drop the files here...' : 'Drag & drop images here, or click to select files'}
          </p>
          <p className="text-xs text-muted-foreground">
            Max {maxFiles} images, {maxSize / (1024 * 1024)}MB each
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-4" disabled={value.length >= maxFiles}>
            Select Images
          </Button>
        </div>
      </div>
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((file, index) => (
            <div key={index} className="relative group border rounded-lg p-2 space-y-2">
              <div className="flex items-center space-x-2">
                <FileIcon className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm truncate">
                  {typeof file === 'string' ? file.split('/').pop() : file.name}
                </span>
              </div>
              {typeof file !== 'string' && uploadProgress[file.name] < 100 && (
                 <Progress value={uploadProgress[file.name] || 0} className="h-2" />
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={() => removeFile(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
