import * as React from "react";
import { cn } from "@/lib/utils";

const CustomTooltip = ({ 
  text, 
  position = "top",
  children,
  className = "" 
}) => {
  const [show, setShow] = React.useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-xs text-white bg-black rounded shadow-lg",
            positions[position],
            className
          )}
          role="tooltip"
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default CustomTooltip; 