
import { cn } from "@/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <img
      src="/camly.png"
      alt="Camly Logo"
      className={cn(className)}
    />
  );
}
