import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "w-full border-t border-slate-200 bg-white py-4",
        className
      )}
    >
      <div className="mx-auto max-w-2xl px-4 text-center text-xs text-slate-400">
        Wordsort &copy; {new Date().getFullYear()}
      </div>
    </footer>
  );
}
