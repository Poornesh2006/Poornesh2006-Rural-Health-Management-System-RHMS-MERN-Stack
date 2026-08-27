import { motion, useReducedMotion } from "framer-motion";
import { FiActivity, FiHeart, FiShield, FiUsers } from "react-icons/fi";

const items = [
  { label: "Patients", icon: FiUsers },
  { label: "Care Team", icon: FiHeart },
  { label: "Community", icon: FiShield },
  { label: "Health", icon: FiActivity },
];

export function IntroMedicalIcons() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-3 text-white"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            key={item.label}
            transition={{ delay: reduceMotion ? 0 : 2.9 + index * 0.14, duration: 0.25 }}
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-white/12">
              <Icon size={18} />
            </div>
            <p className="mt-2 text-sm font-medium text-white/86">{item.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
