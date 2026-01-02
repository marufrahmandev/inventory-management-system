import React, { forwardRef } from "react";
import { classNames } from "../configs/navbar";

type SelectInputProps = React.InputHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
  layout?: "inline" | "stacked";
  options: { value: string; label: string }[];
  defaultValue?: string;
};

const Select = forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    {
      label,
      error,
      labelClassName = "",
      inputClassName = "",
      containerClassName = "",
      layout = "inline",
      options,
      defaultValue = "",
      required = false,
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
          <select
            ref={ref}
            {...rest}
            id={(rest as any)?.name}
            {...(rest.value !== undefined ? { value: rest.value } : { defaultValue })}
            aria-placeholder={rest?.placeholder || `Select ${label}`}
            className={`col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6
            ${error ? "outline-red-500" : ""} ${inputClassName || ""}`}
          >
            <option value="" disabled>
              {rest?.placeholder || `Select ${label}`}
            </option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
    );
  }
);

export default Select;
