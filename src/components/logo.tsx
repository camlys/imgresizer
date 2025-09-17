import { cn } from "@/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="ImgResizer Logo"
      width={64}
      height={64}
      className={cn("object-contain animate-spin", className)}
      style={{ animationDuration: '10s' }}
    />
  );
}
