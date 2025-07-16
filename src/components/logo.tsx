import { cn } from "@/lib/utils";
import Image from 'next/image';

export function LogoIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-9", className)}>
      <Image
        src="https://placehold.co/36x36.png"
        alt="Camly Logo"
        fill
        sizes="36px"
        className="object-contain"
        data-ai-hint="logo"
      />
    </div>
  );
}
