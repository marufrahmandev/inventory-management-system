import React from "react";
import { classNames } from "../configs/navbar";

interface Option {
  label: string;
  value: string;
}

interface RadioGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  options: Option[];
  defaultCheckedValue?: string;
  labelClassName?: string;
  radioClassName?: string;
  radioLabelClassName?: string;
  error?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  labelClassName = "",
  options,
  defaultCheckedValue = "",

  radioClassName = "",
  radioLabelClassName = "",
  error = "",
  ...rest
}) => {
  return (
    <div className="flex space-x-5 justify-start items-center">
      {label && (
        <label
          className={classNames(
            "block text-sm/6 font-medium text-gray-900 min-w-[150px]",
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      <div className="flex flex-col gap-2 justify-start items-start">
        <div className="mt-2 flex flex-col sm:flex-row gap-4">
          {options.map((opt) => (
            <label
              key={opt.value}
              htmlFor={opt.value}
              className={classNames(
                "flex items-center gap-2 text-sm text-gray-900",
                radioLabelClassName
              )}
            >
              <input
                {...rest}
                type="radio"
                id={opt.value}
                name={rest.name}
                value={opt.value}
                defaultChecked={defaultCheckedValue === opt.value}
                onChange={(e) => rest.onChange?.(e)}
                className={classNames(
                  "size-4 border-gray-300 text-indigo-600 focus:ring-indigo-600",
                  radioClassName
                )}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>

        {error && <p className="text-red-500 text-xs mt-1 ">{error}</p>}
      </div>
    </div>
  );
};

export default RadioGroup;
