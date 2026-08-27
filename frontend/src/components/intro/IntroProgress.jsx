import { motion, useReducedMotion } from "framer-motion";

export function IntroProgress({ duration }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto mt-7 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/14">
      <motion.div
        animate={{ width: "100%" }}
        className="h-full rounded-full bg-white"
        initial={{ width: 0 }}
        transition={{ duration: reduceMotion ? 1 : duration / 1000, ease: "easeInOut" }}
      />
    </div>
  );
}
