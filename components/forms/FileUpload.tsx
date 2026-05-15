"use client";

import React, { useState, useRef } from "react";

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  error?: string;
  maxSize?: number; // in MB
}

export default function FileUpload({
  label,
  accept,
  multiple = false,
  onFilesSelected,
  error,
  maxSize = 10,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        return false;
      }
      return true;
    });

    if (multiple) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      onFilesSelected([...selectedFiles, ...validFiles]);
    } else {
      setSelectedFiles(validFiles.slice(0, 1));
      onFilesSelected(validFiles.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="body-md text-text-primary font-normal">
        {label}
      </label>
      <div
        className={`border-2 border-dashed rounded-xl p-8 transition-colors ${
          isDragging
            ? "border-gray-1200 bg-gray-1200/5"
            : error
            ? "border-red-500"
            : "border-input-border bg-input-bg"
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-4">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-text-secondary"
          >
            <path
              d="M28 8H12C10.8954 8 10 8.89543 10 10V38C10 39.1046 10.8954 40 12 40H36C37.1046 40 38 39.1046 38 38V16L28 8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28 8V16H38"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-center">
            <p className="text-text-primary font-medium mb-1">
              Arraste arquivos aqui ou{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary-dark hover:underline"
              >
                clique para selecionar
              </button>
            </p>
            <p className="body-sm text-text-secondary">
              Tamanho máximo: {maxSize}MB
            </p>
          </div>
        </div>
      </div>
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-text-secondary"
                >
                  <path
                    d="M4 4H12L14 6H16V16H4V4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="body-sm text-text-primary">{file.name}</span>
                <span className="body-xs text-text-secondary">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 5L15 15M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <span className="text-red-500 body-sm mt-1">{error}</span>}
    </div>
  );
}
