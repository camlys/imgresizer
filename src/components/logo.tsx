
import { cn } from "@/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <img
      src="/imgresizerlogo.png"
      alt="ImgResizer Logo"
      className={cn("rounded-md", className)}
    />
  );
}
