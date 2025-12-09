import React from "react";
import { classNames } from "../configs/navbar";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  placeholder?: string;
  error?: string;
  labelClassName?: string;
  inputClassName?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  defaultValue?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  placeholder,
  error,
  labelClassName = "",
  inputClassName = "",
  required = false,
  options,
  defaultValue = "",
  ...rest
}) => {
  return (
    <div className="flex space-x-5  justify-start  items-center">
      {label && (
        <label
          htmlFor={rest.id}
          className={classNames(
            "block text-sm/6 font-medium text-gray-900 min-w-[150px]",
            labelClassName || "text-gray-900"
          )}
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="mt-2 flex-grow sm:max-w-[50%]">
        <select
          {...rest}
          defaultValue={defaultValue}
          aria-placeholder={placeholder || `Select ${label}`}
          className={`col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6
            ${error ? "outline-red-500" : ""} ${inputClassName || ""}`}
        >
         <option value="" disabled selected>{placeholder || `Select ${label}`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default Select;