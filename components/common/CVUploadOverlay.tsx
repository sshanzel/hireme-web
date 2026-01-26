'use client';

import {useRef} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useFileUpload, CV_UPLOAD_CONFIG} from '@/hooks/useFileUpload';
import {useAuthContext} from '@/contexts/AuthContext';
import {apiUpload, endpoints} from '@/lib/api';
import {Upload, FileText, X, Loader2, AlertCircle} from 'lucide-react';
import {cn} from '@/lib/utils';

interface UploadResponse {
  cvUploadedAt?: string;
}

async function uploadCV(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload<UploadResponse>(endpoints.cvUpload, formData);
}

export function CVUploadOverlay() {
  const {user, setUser} = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    selectedFile,
    validationError,
    isDragOver,
    handleInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
    upload,
    uploadMutation,
  } = useFileUpload<UploadResponse>({
    config: CV_UPLOAD_CONFIG,
    uploadFn: uploadCV,
    onUploadSuccess: data => {
      if (user) {
        setUser({...user, cvUploadedAt: data.cvUploadedAt ?? new Date().toISOString()});
      }
    },
  });

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  if (!user || user.cvUploadedAt) {
    return null;
  }

  const isUploading = uploadMutation?.isPending;
  const uploadError = uploadMutation?.error;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
      <Card className='w-full max-w-lg mx-4'>
        <CardHeader className='text-center'>
          <CardTitle>Upload Your CV</CardTitle>
          <CardDescription className='space-y-2'>
            <span className='block'>
              Your CV helps us extract your work history so you can focus on preparing stories, not
              data entry.
            </span>
            <span className='block text-xs'>
              Privacy is our top priority. Your CV is deleted the moment we finish parsing it, and
              your data stays yours alone.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'relative rounded-lg border-2 border-dashed p-8 transition-colors',
              isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
              validationError && 'border-destructive bg-destructive/5'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type='file'
              accept='.pdf,.doc,.docx'
              onChange={handleInputChange}
              className='hidden'
            />

            {selectedFile ? (
              <div className='flex flex-col items-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                  <FileText className='h-6 w-6 text-primary' />
                </div>
                <div className='text-center'>
                  <p className='font-medium'>{selectedFile.name}</p>
                  <p className='text-sm text-muted-foreground'>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm' onClick={removeFile} disabled={isUploading}>
                    <X className='mr-2 h-4 w-4' />
                    Remove
                  </Button>
                  <Button size='sm' onClick={upload} disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className='mr-2 h-4 w-4' />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                  <Upload className='h-6 w-6 text-muted-foreground' />
                </div>
                <div className='text-center'>
                  <p className='font-medium'>Drag and drop your CV here</p>
                  <p className='text-sm text-muted-foreground'>or</p>
                </div>
                <Button variant='outline' onClick={handleBrowseClick}>
                  Browse Files
                </Button>
                <p className='text-xs text-muted-foreground'>PDF, DOC, DOCX up to 5MB</p>
              </div>
            )}
          </div>

          {validationError && (
            <div className='mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>
              <AlertCircle className='h-4 w-4 shrink-0' />
              {validationError.message}
            </div>
          )}

          {uploadError && (
            <div className='mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>
              <AlertCircle className='h-4 w-4 shrink-0' />
              {uploadError.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
