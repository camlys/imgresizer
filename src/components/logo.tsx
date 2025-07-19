import { cn } from "@/lib/utils";
import Image from 'next/image';

export function LogoIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-9", className)}>
      <Image
        src="/logo.png"
        alt="Camly Logo"
        fill
        sizes="36px"
        className="object-contain"
      />
    </div>
  );
}
