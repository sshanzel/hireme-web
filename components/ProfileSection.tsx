'use client';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {useAuthContext} from '@/contexts/AuthContext';
import {useFileUpload, CV_UPLOAD_CONFIG} from '@/hooks/useFileUpload';
import {Upload, File, X, Loader2, CheckCircle, AlertCircle} from 'lucide-react';
import {ExperienceList} from '@/components/ExperienceList';

async function uploadCV(file: File): Promise<{success: boolean}> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('cv', file);

  const response = await fetch('/api/cv/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Upload failed'}));
    throw new Error(error.message || 'Failed to upload CV');
  }

  return response.json();
}

export function ProfileSection() {
  const {user} = useAuthContext();

  const {
    selectedFile,
    validationError,
    isDragOver,
    removeFile,
    handleInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    upload,
    uploadMutation,
  } = useFileUpload({
    config: CV_UPLOAD_CONFIG,
    uploadFn: uploadCV,
  });

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <p className="text-sm text-muted-foreground">{user?.name || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload CV</CardTitle>
          <CardDescription>
            Upload your CV to automatically populate your profile. Supported formats: PDF, DOC, DOCX (max 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : validationError
                  ? 'border-destructive/50 bg-destructive/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleInputChange}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={uploadMutation?.isPending}
            />

            {!selectedFile && !validationError && (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium">Drop your CV here or click to browse</p>
                <p className="text-xs text-muted-foreground">PDF, DOC, DOCX up to 5MB</p>
              </div>
            )}

            {validationError && (
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-sm font-medium text-destructive">{validationError.message}</p>
                <p className="text-xs text-muted-foreground">Please select a different file</p>
              </div>
            )}

            {selectedFile && !validationError && (
              <div className="flex flex-col items-center gap-2">
                <File className="h-10 w-10 text-primary" />
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {selectedFile && !validationError && (
            <div className="mt-4 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={removeFile}
                disabled={uploadMutation?.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Remove
              </Button>
              <Button
                size="sm"
                onClick={upload}
                disabled={uploadMutation?.isPending}
              >
                {uploadMutation?.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CV
                  </>
                )}
              </Button>
            </div>
          )}

          {uploadMutation?.isSuccess && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700 dark:bg-green-950 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm">CV uploaded successfully! We&apos;re parsing your information.</p>
            </div>
          )}

          {uploadMutation?.isError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{uploadMutation.error.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ExperienceList />
    </div>
  );
}
