import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Upload } from "lucide-react";

const FileInput = ({
  id,
  label = "Import Excel",
  accept = ".xlsx,.xls",
  onChange,
  onRemove,
  showRemoveButton = true,
  required = false,
  error,
  className = "",
  maxSize = 10, // MB
  multiple = true, // Enable multiple file selection
  ...props
}) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const validateFiles = (selectedFiles) => {
    return Array.from(selectedFiles).filter(
      (file) => file.size <= maxSize * 1024 * 1024,
    );
  };

  const handleFileChange = (e) => {
    const selectedFiles = validateFiles(e.target.files);
    if (selectedFiles.length) {
      setIsLoading(true);
      setFiles((prev) => [...prev, ...selectedFiles]);
      onChange?.({ target: { files: selectedFiles } });
      setIsLoading(false);
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      const selectedFiles = validateFiles(e.dataTransfer.files);
      if (selectedFiles.length) {
        setIsLoading(true);
        setFiles((prev) => [...prev, ...selectedFiles]);
        onChange?.({ target: { files: selectedFiles } });
        setIsLoading(false);
      }
    }
  };

  const handleRemove = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

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
        <div
          ref={dropZoneRef}
          className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer ${
            dragActive
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          } ${files.length ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <input
            ref={fileInputRef}
            id={id}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
            {...props}
          />
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            {files.length ? (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {files.map((file, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="font-medium">{file.name}</p>
                    <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Drag and drop or{" "}
                    <span className="text-blue-600 dark:text-blue-400 underline">
                      browse
                    </span>{" "}
                    to upload
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Excel (.xlsx, .xls) up to {maxSize}MB
                  </p>
                </div>
              </>
            )}
          </div>
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        {showRemoveButton && files.length > 0 && (
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

export default FileInput;
