import React from "react";

interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, ...rest }) => {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-900">
      <input
        {...rest}
        type="checkbox"
        className="size-4 rounded border-gray-300 text-indigo-600
        focus:ring-indigo-600"
      />
      {label}
    </label>
  );
};

export default Checkbox;
