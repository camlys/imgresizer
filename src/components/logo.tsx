import { cn } from "@/lib/utils";
import Image from 'next/image';

export function LogoIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-12", className)}>
      <Image
        src="/logo.png"
        alt="Camly Logo"
        fill
        sizes="48px"
        className="object-contain"
      />
    </div>
  );
}
