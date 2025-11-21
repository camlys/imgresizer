
import { cn } from "@/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <img
      src="/camlylogo.jpg"
      alt="Camly Logo"
      className={cn("rounded-md", className)}
    />
  );
}
