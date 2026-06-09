import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Wordsort
        </span>
        <span className="text-xs text-slate-400 tabular-nums">
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </header>
  );
}
