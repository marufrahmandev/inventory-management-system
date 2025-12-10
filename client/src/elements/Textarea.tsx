import React, { forwardRef } from "react";
import { classNames } from "../configs/navbar";

type TextareaProps = React.InputHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  labelClassName?: string;
  inputClassName?: string;
  rows?: number;
};

const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, required = false, labelClassName = "", inputClassName = "", rows = 3, ...rest },
    ref
  ) => {
    return (
      <div className="flex space-x-5  justify-start  items-center">
        {label && (
          <label
            htmlFor={(rest as any)?.name}
            className={classNames(
              "block text-sm/6 font-medium text-gray-900 min-w-[150px]",
              (rest as any)?.labelClassName || "text-gray-900"
            )}
          >
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="mt-2 flex-grow sm:max-w-[50%]">
          <textarea
            id={(rest as any)?.name}
            ref={ref}
            {...rest}
            className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6
            ${error ? "outline-red-500" : ""} ${(rest as any)?.inputClassName || ""}`}
            rows={ (rest as any)?.rows || 3}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
    );
  }
);

export default TextareaInput;
