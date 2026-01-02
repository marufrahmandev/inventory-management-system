import React, { forwardRef } from "react";
import { classNames } from "../configs/navbar";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
  layout?: "inline" | "stacked";
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      required = false,
      labelClassName = "",
      inputClassName = "",
      containerClassName = "",
      layout = "inline",
      ...rest
    },
    ref
  ) => {
    const isStacked = layout === "stacked";
    return (
      <div
        className={classNames(
          isStacked ? "flex flex-col gap-1 items-start" : "flex space-x-5 justify-start items-center"
        )}
      >
        {label && (
          <label
            htmlFor={(rest as any)?.name}
            className={classNames(
              isStacked
                ? "block text-sm/6 font-medium text-gray-900"
                : "block text-sm/6 font-medium text-gray-900 min-w-[150px]",
              labelClassName || "text-gray-900"
            )}
          >
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div
          className={classNames(
            isStacked ? "w-full" : "mt-2 flex-grow sm:max-w-[50%]",
            containerClassName
          )}
        >
          <input
            ref={ref}
            
            {...rest}
            id={(rest as any)?.name}
            className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6
            ${error ? "outline-red-500" : ""} ${inputClassName || ""}`}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
    );
  }
);

export default Input;
