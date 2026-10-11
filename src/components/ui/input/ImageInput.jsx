import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon } from "lucide-react";

const ImageInput = ({
  id,
  label = "Image",
  value = "",
  onChange,
  onRemove,
  accept = "image/*",
  previewSize = "w-32 h-20",
  showRemoveButton = true,
  required = false,
  error,
  className = "",
  placeholder = "Choose an image file",
  maxSize = 10, // MB
  currentImage = null, // For editing mode - existing image URL
  ...props
}) => {
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    // If there's a new file selected, don't override its preview
    // The preview for new files is handled in processFile function
    if (file) {
      return;
    }

    // If there's a value (from form), use it
    if (value) {
      setPreview(value);
    }
    // If there's a current image (for editing), use it
    else if (currentImage) {
      setPreview(currentImage);
    }
    // Otherwise, clear preview
    else {
      setPreview("");
    }
  }, [value, currentImage, file]);

  // Reset file when currentImage changes (for edit mode)
  useEffect(() => {
    if (currentImage && !file) {
      setFile(null);
    }
  }, [currentImage, file]);

  const validateAndSetFile = (selectedFile) => {
    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return false;
    }

    // Check file type
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateAndSetFile(selectedFile)) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile) => {
    setIsLoading(true);

    // Create preview first
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target.result;
      setPreview(previewUrl);
      setFile(selectedFile);
      // Pass the File object to parent - they should handle it as FormData
      onChange?.(selectedFile, previewUrl);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setIsLoading(false);
      alert("Error reading file");
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (validateAndSetFile(selectedFile)) {
        processFile(selectedFile);
      }
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const getPreviewSrc = () => {
    // If there's a new file selected, use its preview
    if (file) {
      return preview;
    }

    // If there's a preview URL (from current image or value)
    if (preview) {
      // If it's already a full URL, use it as is
      if (preview.startsWith("http") || preview.startsWith("data:")) {
        return preview;
      }
      // If it's a relative path, prepend the API URL
      if (import.meta.env.VITE_API_URL) {
        return `${import.meta.env.VITE_API_URL}/${preview}`;
      }
      return preview;
    }

    // Fallback to currentImage if no preview is set
    if (currentImage) {
      if (currentImage.startsWith("http") || currentImage.startsWith("data:")) {
        return currentImage;
      }
      if (import.meta.env.VITE_API_URL) {
        return `${import.meta.env.VITE_API_URL}/${currentImage}`;
      }
      return currentImage;
    }

    return "";
  };

  const hasImage = file || preview || currentImage;

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <Label
          htmlFor={id}
          className={
            required
              ? "after:content-['*'] after:ml-0.5 after:text-red-500"
              : ""
          }
        >
          {label}
        </Label>
      )}

      <div className="space-y-4">
        {/* Drag & Drop Zone */}
        <div
          ref={dropZoneRef}
          className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer ${
            dragActive
              ? "border-primary bg-orange-50 dark:bg-orange-950/20 scale-105"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          } ${hasImage ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            id={id}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            {...props}
          />

          <div className="flex flex-col items-center justify-center text-center space-y-3">
            {hasImage ? (
              <>
                <div className="relative">
                  <img
                    src={getPreviewSrc()}
                    alt="Preview"
                    className={`${previewSize} object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600`}
                    onError={(e) => {
                      e.target.style.display = "none";
                      // Show fallback
                      const fallback = e.target.nextSibling;
                      if (fallback) {
                        fallback.style.display = "flex";
                      }
                    }}
                    onLoad={() => {
                      // Image loaded successfully
                    }}
                  />
                  {/* Fallback when image fails to load */}
                  <div
                    className="hidden items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                    style={{ width: "128px", height: "80px" }}
                  >
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        Image not available
                      </p>
                    </div>
                  </div>
                  {file && (
                    <div className="absolute -top-2 -right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      New
                    </div>
                  )}
                  {!file && (currentImage || value) && (
                    <div className="absolute -top-2 -right-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                      Current
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {file ? (
                    <div className="space-y-1">
                      <p className="font-medium">{file.name}</p>
                      <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <p>Current image loaded</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Drag and drop or{" "}
                    <span className="text-primary dark:text-primary underline">
                      browse
                    </span>{" "}
                    to upload
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF up to {maxSize}MB
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        {/* Remove Button */}
        {showRemoveButton && hasImage && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default ImageInput;
