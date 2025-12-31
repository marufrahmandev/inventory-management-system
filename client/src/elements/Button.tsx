import React from 'react'
import { classNames } from '../configs/navbar';

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

function Button({ type = "button", className = "action_btn", onClick, children, disabled = false }: ButtonProps) { 
  return (
    <button type={type} className={classNames(
            "action_btn",
            className
          )} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;