import { cn } from "@/lib/utils";

const CustomCard = ({ 
  className, 
  children, 
  hover = false,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        hover && "transition-all hover:shadow-md hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default CustomCard;

export const CustomCardHeader = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CustomCardTitle = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CustomCardDescription = ({
  className,
  children,
  ...props
}) => {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
};

export const CustomCardContent = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}; 