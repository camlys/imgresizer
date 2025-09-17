import { cn } from "@/lib/utils";
import Image from 'next/image';

export function LogoIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="ImgResizer Logo"
      width={64}
      height={64}
      className={cn("object-contain animate-spin", className)}
      style={{ animationDuration: '10s' }}
    />
  );
}
