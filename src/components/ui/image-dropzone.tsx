"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ImageDropzoneProps {
  value?: string;
  onChange: (file: File | null) => void;
  onError?: (error: string) => void;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  value,
  onChange,
  onError,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string>(value || "");

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      onError?.("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onError?.("Image size must be less than 5MB");
      return;
    }

    onChange(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    onChange(null);
    setPreview("");
  };

  React.useEffect(() => {
    if (value) {
      setPreview(value);
    } else {
      setPreview("");
    }
  }, [value]);

  return (
    <div>
      {preview ? (
        <div className="relative">
          <div className="relative w-[150px] h-[150px] border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={preview}
              alt="Preview"
              width={150}
              height={150}
              className="w-full h-full object-cover"
              unoptimized
              key={preview}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-gray-300 text-gray-700 rounded-full p-1 hover:bg-gray-400 transition-colors shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Click to remove</p>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("image-upload")?.click()}
          className={`w-[150px] h-[150px] border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all ${
            isDragOver
              ? "border-brand-500 bg-brand-50"
              : "border-gray-300 hover:border-brand-400 hover:bg-gray-50"
          }`}
        >
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-1 px-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-8 w-8 ${
                isDragOver ? "text-brand-500" : "text-gray-400"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div className="text-xs text-center text-gray-600">
              <span className="font-medium text-brand-600">Upload</span>
            </div>
            <p className="text-[10px] text-gray-500 text-center">Max 5MB</p>
          </div>
        </div>
      )}
    </div>
  );
};
