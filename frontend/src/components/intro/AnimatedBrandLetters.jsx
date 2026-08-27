import { motion, useReducedMotion } from "framer-motion";

const letters = ["R", "H", "M", "S"];

export function AnimatedBrandLetters() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className="flex items-center justify-center gap-3">
        {letters.map((letter) => (
          <span
            className="ui-stat text-6xl font-bold tracking-[0.08em] text-white md:text-7xl"
            key={letter}
          >
            {letter}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 md:gap-4">
      {letters.map((letter, index) => (
        <motion.span
          animate={{
            filter: "blur(0px)",
            opacity: 1,
            scale: 1,
            textShadow: "0 0 22px rgba(137, 220, 255, 0.42)",
            y: 0,
          }}
          className="ui-stat text-6xl font-bold tracking-[0.08em] text-white md:text-7xl"
          initial={{
            filter: "blur(10px)",
            opacity: 0.18,
            scale: 0.45,
            textShadow: "0 0 0 rgba(0, 0, 0, 0)",
            y: 18,
          }}
          key={letter}
          transition={{
            damping: 14,
            delay: 0.35 + index * 0.24,
            stiffness: 140,
            type: "spring",
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}
