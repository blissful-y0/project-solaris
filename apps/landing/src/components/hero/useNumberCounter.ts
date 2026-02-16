import { useState, useEffect, useRef } from "react";

export function useNumberCounter(
  target: number,
  duration = 2000,
  start = false,
  from = 0
) {
  const [value, setValue] = useState(from);
  const [isComplete, setIsComplete] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!start) return;

    setValue(from);
    setIsComplete(false);
    const startTime = performance.now();
    const range = target - from;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + eased * range);

      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsComplete(true);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, start, from]);

  return { value, isComplete };
}
