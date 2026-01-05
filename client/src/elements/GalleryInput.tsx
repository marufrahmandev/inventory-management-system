import React, { forwardRef, useEffect, useState, useMemo, useRef } from "react";
import { classNames } from "../configs/navbar";
import { X } from "lucide-react";

type GalleryInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  labelClassName?: string;
  error?: string;
  inputClassName?: string;
  required?: boolean;
  existingImages?: Array<{ url: string; publicId?: string; optimizedUrl?: string }>;
  onRemoveImage?: (index: number, isExisting: boolean) => void;
};

type PreviewItem = {
  id: string;
  url: string;
  file?: File;
  isExisting: boolean;
  originalIndex?: number;
};

const GalleryInput = forwardRef<HTMLInputElement, GalleryInputProps>(
  (
    {
      label,
      labelClassName = "",
      required = false,
      error = "",
      inputClassName = "",
      existingImages = [],
      onRemoveImage,
      ...rest
    },
    ref
  ) => {
    const [previews, setPreviews] = useState<PreviewItem[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const existingImagesRef = useRef<string>("");
    const fileIdCounter = useRef(0);

    // Memoize existing images to prevent infinite loops
    const existingImagesKey = useMemo(() => {
      return JSON.stringify(existingImages.map(img => img.url || img.optimizedUrl));
    }, [existingImages]);

    // Only update when existingImages actually changes
    useEffect(() => {
      if (existingImagesRef.current === existingImagesKey) {
        return;
      }
      existingImagesRef.current = existingImagesKey;

      // Set existing images as previews
      const existingPreviews: PreviewItem[] = existingImages.map((img, idx) => ({
        id: `existing-${idx}-${img.publicId || img.url}`,
        url: img.optimizedUrl || img.url,
        isExisting: true,
        originalIndex: idx,
      }));

      // Keep new files that were added
      const newFilePreviews: PreviewItem[] = newFiles.map((file) => ({
        id: `new-${fileIdCounter.current++}`,
        url: URL.createObjectURL(file),
        file,
        isExisting: false,
      }));

      setPreviews([...existingPreviews, ...newFilePreviews]);
    }, [existingImagesKey, existingImages]);

    // Cleanup object URLs on unmount
    useEffect(() => {
      return () => {
        previews.forEach((preview) => {
          if (!preview.isExisting && preview.url.startsWith("blob:")) {
            URL.revokeObjectURL(preview.url);
          }
        });
      };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;

      const files = Array.from(e.target.files);
      
      // Add new files to state and update previews
      setNewFiles((prev) => {
        const updatedFiles = [...prev, ...files];
        
        // Create previews for new files
        const newPreviews: PreviewItem[] = files.map((file) => ({
          id: `new-${fileIdCounter.current++}`,
          url: URL.createObjectURL(file),
          file,
          isExisting: false,
        }));

        // Update previews - keep existing images and add new file previews
        setPreviews((prevPreviews) => {
          const existingPreviews = prevPreviews.filter(p => p.isExisting);
          return [...existingPreviews, ...newPreviews];
        });

        // Create a new FileList-like object for react-hook-form
        const dataTransfer = new DataTransfer();
        updatedFiles.forEach(file => dataTransfer.items.add(file));
        
        // Call the onChange handler from react-hook-form
        if (rest.onChange) {
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              files: dataTransfer.files,
            },
          } as React.ChangeEvent<HTMLInputElement>;
          rest.onChange(syntheticEvent);
        }

        return updatedFiles;
      });
    };

    const handleRemove = (id: string, isExisting: boolean, originalIndex?: number) => {
      setPreviews((prev) => {
        const previewToRemove = prev.find(p => p.id === id);
        
        // Cleanup object URL if it's a new file
        if (previewToRemove && !previewToRemove.isExisting && previewToRemove.url.startsWith("blob:")) {
          URL.revokeObjectURL(previewToRemove.url);
        }

        // Remove from previews
        const newPreviews = prev.filter((p) => p.id !== id);
        
        // If it's a new file, also remove from newFiles
        if (!isExisting && previewToRemove?.file) {
          setNewFiles((files) => files.filter((f) => f !== previewToRemove.file));
        }

        return newPreviews;
      });

      if (onRemoveImage && originalIndex !== undefined) {
        onRemoveImage(originalIndex, isExisting);
      }
    };

    return (
      <div className="flex space-x-5 justify-start items-start">
        {label && (
          <label
            htmlFor={rest.id}
            className={classNames(
              "block text-sm/6 font-medium text-gray-900 min-w-[150px] pt-2",
              labelClassName || "text-gray-900"
            )}
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className={classNames("mt-2 flex-grow")}>
          <div className="flex flex-col gap-4">
            {/* File input */}
            <input
              ref={ref}
              {...rest}
              type="file"
              multiple
              accept="image/*"
              className={classNames(
                "block w-full text-sm text-gray-900",
                "file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100",
                error ? "outline-red-500" : "outline-gray-300",
                inputClassName || ""
              )}
              onChange={handleFileChange}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            {/* Gallery preview */}
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {previews.map((preview) => (
                  <div key={preview.id} className="relative group">
                    <img
                      src={preview.url}
                      alt={`Preview ${preview.id}`}
                      className="h-24 w-24 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(preview.id, preview.isExisting, preview.originalIndex)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

GalleryInput.displayName = "GalleryInput";

export default GalleryInput;

