"use client";

import { useEffect, useState } from "react";
import { formatCountdown, getMsUntilMidnightUTC } from "@/lib/daily-puzzle";

export function useCountdown(): string {
  const [display, setDisplay] = useState(() =>
    formatCountdown(getMsUntilMidnightUTC())
  );

  useEffect(() => {
    const tick = () => setDisplay(formatCountdown(getMsUntilMidnightUTC()));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return display;
}
