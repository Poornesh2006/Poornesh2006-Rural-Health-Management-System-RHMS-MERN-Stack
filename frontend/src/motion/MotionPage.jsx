import { motion } from "framer-motion";
import { pageTransition } from "./transitions";

export function MotionPage({ children, className }) {
  return (
    <motion.div
      animate="animate"
      className={className}
      exit="exit"
      initial="initial"
      variants={pageTransition}
    >
      {children}
    </motion.div>
  );
}
