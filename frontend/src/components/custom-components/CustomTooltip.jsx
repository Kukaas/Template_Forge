import * as React from "react";
import { cn } from "@/lib/utils";

const CustomTooltip = ({ 
  text, 
  position = "top",
  children,
  className = "" 
}) => {
  const [show, setShow] = React.useState(false);
  const [actualPosition, setActualPosition] = React.useState(position);
  const tooltipRef = React.useRef(null);
  const containerRef = React.useRef(null);

  const updatePosition = React.useCallback(() => {
    if (!tooltipRef.current || !containerRef.current) return;

    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let newPosition = position;
    const margin = 10; // minimum distance from viewport edge

    // Check if tooltip would go off screen in its current position
    if (position === 'top' && rect.top - tooltipRect.height < margin) {
      newPosition = 'bottom';
    } else if (position === 'bottom' && rect.bottom + tooltipRect.height > window.innerHeight - margin) {
      newPosition = 'top';
    } else if (position === 'left' && rect.left - tooltipRect.width < margin) {
      newPosition = 'right';
    } else if (position === 'right' && rect.right + tooltipRect.width > window.innerWidth - margin) {
      newPosition = 'left';
    }

    setActualPosition(newPosition);
  }, [position]);

  React.useEffect(() => {
    if (show) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [show, updatePosition]);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-3.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-3.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-3.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-3.5",
  };

  const arrowPositions = {
    top: "bottom-[-6px] left-1/2 -translate-x-1/2 border-t-primary/80 border-l-transparent border-r-transparent border-b-transparent",
    bottom: "top-[-6px] left-1/2 -translate-x-1/2 rotate-180 border-t-primary/80 border-l-transparent border-r-transparent border-b-transparent",
    left: "right-[-6px] top-1/2 -translate-y-1/2 rotate-90 border-t-primary/80 border-l-transparent border-r-transparent border-b-transparent",
    right: "left-[-6px] top-1/2 -translate-y-1/2 -rotate-90 border-t-primary/80 border-l-transparent border-r-transparent border-b-transparent",
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="inline-block"
      >
        {children}
      </div>
      {show && (
        <div className="relative">
          <div
            ref={tooltipRef}
            className={cn(
              "absolute z-50 px-3 py-2 text-sm",
              "bg-gradient-to-br from-primary/80 to-primary/70",
              "text-primary-foreground font-medium",
              "rounded-md shadow-xl",
              "backdrop-blur-md",
              "border border-primary/20",
              "animate-in fade-in-0 zoom-in-95 duration-150 ease-out",
              "max-w-[280px] break-words",
              "select-none pointer-events-none",
              positions[actualPosition],
              className
            )}
            role="tooltip"
          >
            <div className="relative z-10">
              {text}
            </div>
            <div 
              className={cn(
                "absolute w-2 h-2 border-[5px]",
                arrowPositions[actualPosition]
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTooltip; 