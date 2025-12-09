import React from 'react'
import { classNames } from '../configs/navbar';

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

function Button({ type = "button", className = "action_btn", onClick, children }: ButtonProps) { 
  return (
    <button type={type} className={classNames(
            "action_btn",
            className
          )} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;