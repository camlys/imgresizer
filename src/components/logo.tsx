import { cn } from "@/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <div className={cn(
      "flex items-center justify-center size-9 rounded-lg bg-gradient-to-br from-primary to-accent",
      className
    )}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary-foreground"
      >
        <path
          d="M12 2L12 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 18L12 22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M19.0711 4.92896L16.2426 7.75738"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7.75732 16.2426L4.9289 19.0711"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M22 12L18 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6 12L2 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M19.0711 19.0711L16.2426 16.2426"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7.75732 7.75738L4.9289 4.92896"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    </div>
  );
}
