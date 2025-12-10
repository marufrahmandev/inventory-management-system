import React, { forwardRef } from "react";
import { classNames } from "../configs/navbar";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelClassName?: string;
  error?: string;
  defaultChecked?: boolean;
  required?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      labelClassName = "",
      error = "",
      defaultChecked = false,
      required = false,
      ...rest
    },
    ref
  ) => {
    return (
      <>
        <label
          className={classNames(
            "flex items-center gap-2 text-sm text-gray-900",
            labelClassName
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            defaultChecked={defaultChecked}
            {...rest}
            className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </>
    );
  }
);

export default Checkbox;



{/* <Checkbox
                label="Terms and Conditions"
                {...register("terms")}
                defaultChecked={false}
                error={errors.terms?.message}
                required
              /> */}