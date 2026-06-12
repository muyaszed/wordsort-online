"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#ec4899"];
const SHAPES = ["rounded-sm", "rounded-full", "rounded-none"];
const COUNT = 36;

interface Piece {
  id: number;
  color: string;
  shape: string;
  left: number;
  delay: number;
  duration: number;
  width: number;
  height: number;
  rotateEnd: number;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function ConfettiBurst() {
  const shouldReduce = useReducedMotion();

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        shape: SHAPES[Math.floor(seededRandom(i * 3) * SHAPES.length)],
        left: 5 + seededRandom(i * 7) * 90,
        delay: seededRandom(i * 11) * 0.55,
        duration: 0.9 + seededRandom(i * 13) * 0.5,
        width: 8 + Math.floor(seededRandom(i * 17) * 8),
        height: 6 + Math.floor(seededRandom(i * 19) * 8),
        rotateEnd: 180 + Math.floor(seededRandom(i * 23) * 360),
      })),
    []
  );

  if (shouldReduce) return null;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-50"
    >
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute ${p.shape}`}
          style={{
            backgroundColor: p.color,
            left: `${p.left}%`,
            top: 0,
            width: p.width,
            height: p.height,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0, scaleX: 1 }}
          animate={{
            y: [0, 200, 500],
            opacity: [1, 1, 0],
            rotate: [0, p.rotateEnd / 2, p.rotateEnd],
            scaleX: [1, 0.6, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}
