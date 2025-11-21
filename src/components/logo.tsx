
import { cn } from "@/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <img
      src="/camlylogo.png"
      alt="Camly Logo"
      className={cn("rounded-md", className)}
    />
  );
}
