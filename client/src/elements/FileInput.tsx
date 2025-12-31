import React, { forwardRef, useEffect, useState } from "react";
import { classNames } from "../configs/navbar";

type FileInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  labelClassName?: string;
  error?: string;
  inputClassName?: string;
  required?: boolean;
  imageUrl?: string;
};

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      label,
      labelClassName = "",
      required = false,
      error = "",
      inputClassName = "",
      imageUrl = "",
      ...rest
    },
    ref
  ) => {
 
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPreview(null);
      console.log(e.target.files?.[0]?.type);
      console.log(rest.accept);
      if (!e.target.files?.[0]?.type.includes("image/")) {
        rest.onChange?.(e);
        return;
      }

      // handle image preview
      const file = e.target.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      setPreview(url);

      rest.onChange?.(e);
    };

    useEffect(() => {
      if (imageUrl) {
        setPreview(imageUrl);
      }
    }, [imageUrl]);
    return (
      <div className="flex space-x-5  justify-start  items-center">
        {label && (
          <label
            htmlFor={rest.id}
            className={classNames(
              "block text-sm/6 font-medium text-gray-900 min-w-[150px]",
              "text-gray-900"
            )}
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className={classNames("mt-2 flex-grow flex gap-2")}>
          <div className="flex flex-col gap-2 justify-center">
            <input
              ref={ref}
              {...rest}
              type="file"
              className={classNames(
                "block w-full text-sm text-gray-900",
                "file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100",
                error ? "outline-red-500" : "outline-gray-300",
                inputClassName || ""
              )}
              onChange={handleFileChange}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          {/* Image preview */}
          { preview && (
            <div className="flex-grow">
              <img
                src={preview}
                alt="Preview"
                className="h-28 w-28 object-cover rounded-md border"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default FileInput;
