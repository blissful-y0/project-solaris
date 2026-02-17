import { useState, useEffect } from "react";

export function useTypingAnimation(
  lines: string[],
  typingSpeed = 50,
  lineDelay = 1000
) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentLine >= lines.length) {
      setIsComplete(true);
      return;
    }

    if (currentChar < lines[currentLine].length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          updated[currentLine] =
            (updated[currentLine] || "") + lines[currentLine][currentChar];
          return updated;
        });
        setCurrentChar((c) => c + 1);
      }, typingSpeed);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCurrentLine((l) => l + 1);
      setCurrentChar(0);
    }, lineDelay);
    return () => clearTimeout(timer);
  }, [currentLine, currentChar, lines, typingSpeed, lineDelay]);

  return { displayedLines, isComplete };
}
