import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({ 
  size = "md", 
  className 
}: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div 
      className={cn(
        "rounded-full border-t-transparent animate-spin",
        "border-chart-1",
        sizeClass[size],
        className
      )} 
    />
  );
}