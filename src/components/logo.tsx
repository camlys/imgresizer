
import { cn } from "@/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={cn("animate-spin", className)}
      style={{ animationDuration: '10s' }}
      fill="currentColor"
    >
        <path d="M50,9A41,41,0,1,0,91,50,41,41,0,0,0,50,9Zm0,74A33,33,0,1,1,83,50,33,33,0,0,1,50,83Z" />
        <path d="M50,25.5A24.5,24.5,0,1,0,74.5,50,24.5,24.5,0,0,0,50,25.5Zm0,41A16.5,16.5,0,1,1,66.5,50,16.5,16.5,0,0,1,50,66.5Z" />
        <path d="M50,37.38A12.62,12.62,0,1,0,62.62,50,12.62,12.62,0,0,0,50,37.38Zm0,20.24A7.62,7.62,0,1,1,57.62,50,7.62,7.62,0,0,1,50,57.62Z" />
        <path d="M50,45.25a4.75,4.75,0,1,0,4.75,4.75A4.75,4.75,0,0,0,50,45.25Z" />
    </svg>
  );
}
