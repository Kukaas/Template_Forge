import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

const CustomAlert = ({ 
  variant = "info", 
  title, 
  description,
  className = "",
  ...props 
}) => {
  const variants = {
    info: {
      container: "bg-blue-50 dark:bg-blue-900/30",
      icon: <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
      title: "text-blue-800 dark:text-blue-100",
      description: "text-blue-700 dark:text-blue-200"
    },
    success: {
      container: "bg-green-50 dark:bg-green-900/30",
      icon: <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />,
      title: "text-green-800 dark:text-green-100",
      description: "text-green-700 dark:text-green-200"
    },
    warning: {
      container: "bg-yellow-50 dark:bg-yellow-900/30",
      icon: <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />,
      title: "text-yellow-800 dark:text-yellow-100",
      description: "text-yellow-700 dark:text-yellow-200"
    },
    error: {
      container: "bg-red-50 dark:bg-red-900/30",
      icon: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
      title: "text-red-800 dark:text-red-100",
      description: "text-red-700 dark:text-red-200"
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg p-4",
        variants[variant].container,
        className
      )}
      {...props}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {variants[variant].icon}
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={cn("text-sm font-medium", variants[variant].title)}>
              {title}
            </h3>
          )}
          {description && (
            <div className={cn("mt-2 text-sm", variants[variant].description)}>
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomAlert; 