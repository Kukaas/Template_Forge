import { cn } from "@/lib/utils";

const CustomBadge = ({ 
  variant = "default", 
  size = "default", 
  className = "", 
  children 
}) => {
  const variants = {
    default: "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-foreground",
    secondary: "bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 dark:bg-secondary/30 dark:text-secondary-foreground",
    success: "bg-green-100 text-green-800 dark:bg-green-400/20 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-400/20 dark:text-red-400",
  };

  const sizes = {
    default: "px-2.5 py-0.5 text-xs",
    sm: "px-2 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default CustomBadge; 