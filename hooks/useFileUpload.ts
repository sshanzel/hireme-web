import {useState, useCallback} from 'react';
import {useMutation, UseMutationResult} from '@tanstack/react-query';

interface FileValidationError {
  type: 'size' | 'format';
  message: string;
}

interface FileUploadConfig {
  maxSize: number;
  acceptedTypes: string[];
  acceptedExtensions: string[];
}

interface UploadFn<TResponse> {
  (file: File): Promise<TResponse>;
}

interface UseFileUploadOptions<TResponse> {
  config: FileUploadConfig;
  uploadFn?: UploadFn<TResponse>;
  onUploadSuccess?: (data: TResponse) => void;
  onUploadError?: (error: Error) => void;
}

interface UseFileUploadReturn<TResponse> {
  selectedFile: File | null;
  validationError: FileValidationError | null;
  isDragOver: boolean;
  selectFile: (file: File) => void;
  removeFile: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  upload: () => void;
  uploadMutation: UseMutationResult<TResponse, Error, File> | null;
  reset: () => void;
}

function formatFileSize(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2);
}

function validateFile(file: File, config: FileUploadConfig): FileValidationError | null {
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

  if (!config.acceptedTypes.includes(file.type) && !config.acceptedExtensions.includes(extension)) {
    const formats = config.acceptedExtensions.map((ext) => ext.replace('.', '').toUpperCase()).join(', ');
    return {
      type: 'format',
      message: `Invalid file format. Please upload a ${formats} file.`,
    };
  }

  if (file.size > config.maxSize) {
    const maxSizeMB = formatFileSize(config.maxSize);
    const fileSizeMB = formatFileSize(file.size);
    return {
      type: 'size',
      message: `File size exceeds ${maxSizeMB}MB. Your file is ${fileSizeMB}MB.`,
    };
  }

  return null;
}

export function useFileUpload<TResponse = unknown>(
  options: UseFileUploadOptions<TResponse>
): UseFileUploadReturn<TResponse> {
  const {config, uploadFn, onUploadSuccess, onUploadError} = options;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<FileValidationError | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: uploadFn ?? (async () => {
      throw new Error('No upload function provided');
    }),
    onSuccess: (data) => {
      setSelectedFile(null);
      onUploadSuccess?.(data);
    },
    onError: (error: Error) => {
      onUploadError?.(error);
    },
  });

  const selectFile = useCallback(
    (file: File) => {
      setValidationError(null);
      uploadMutation.reset();

      const error = validateFile(file, config);
      if (error) {
        setValidationError(error);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    },
    [config, uploadMutation]
  );

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    uploadMutation.reset();
  }, [uploadMutation]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        selectFile(file);
      }
    },
    [selectFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        selectFile(file);
      }
    },
    [selectFile]
  );

  const upload = useCallback(() => {
    if (selectedFile && uploadFn) {
      uploadMutation.mutate(selectedFile);
    }
  }, [selectedFile, uploadFn, uploadMutation]);

  const reset = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    setIsDragOver(false);
    uploadMutation.reset();
  }, [uploadMutation]);

  return {
    selectedFile,
    validationError,
    isDragOver,
    selectFile,
    removeFile,
    handleInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    upload,
    uploadMutation: uploadFn ? uploadMutation : null,
    reset,
  };
}

export const CV_UPLOAD_CONFIG: FileUploadConfig = {
  maxSize: 5 * 1024 * 1024,
  acceptedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  acceptedExtensions: ['.pdf', '.doc', '.docx'],
};
