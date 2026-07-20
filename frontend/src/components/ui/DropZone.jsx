import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export const DropZone = ({
  onFileDrop,
  acceptedTypes = ['application/pdf'],
  maxSize = 10 * 1024 * 1024, // 10MB
  helperText = 'PDF files up to 10MB',
  className,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateAndProcessFile = (file) => {
    setError(null);
    if (!file) return;

    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed: ${acceptedTypes.join(', ')}`);
      return;
    }

    if (file.size > maxSize) {
      setError(`File is too large. Max size is ${Math.round(maxSize / (1024 * 1024))}MB.`);
      return;
    }

    setSelectedFile(file);
    if (onFileDrop) {
      onFileDrop(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={clsx(
          'w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 select-none bg-surface',
          isDragActive
            ? 'border-primary bg-primary/5 scale-[0.99] shadow-hover'
            : 'border-border hover:border-text-secondary hover:bg-bg/50',
          error ? 'border-danger bg-danger/5' : '',
          className
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3 text-center">
          {selectedFile ? (
            <div className="p-3 bg-primary/10 rounded-full text-primary animate-scale-in">
              <File className="w-8 h-8" />
            </div>
          ) : (
            <div className={clsx(
              'p-3 bg-bg rounded-full text-text-secondary',
              isDragActive && 'text-primary bg-primary/10'
            )}>
              <UploadCloud className="w-8 h-8" />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="font-semibold text-text text-base">
              {selectedFile ? selectedFile.name : 'Drag & drop your resume file here'}
            </span>
            <span className="text-sm text-text-secondary">
              {selectedFile
                ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                : `or click to browse from device`}
            </span>
          </div>
          
          {helperText && !error && !selectedFile && (
            <span className="text-xs text-text-secondary/80 bg-bg px-2.5 py-1 rounded-full border border-border mt-1">
              {helperText}
            </span>
          )}
        </div>
      </div>
      
      {error && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-danger animate-fade-in px-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
