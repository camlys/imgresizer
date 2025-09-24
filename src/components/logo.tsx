
import { cn } from "@/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <img
      src="/ImgResizer.png"
      alt="ImgResizer Logo"
      className={cn(className)}
    />
  );
}
