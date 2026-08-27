import { motion } from "framer-motion";
import { FiActivity, FiCalendar, FiShield, FiUsers } from "react-icons/fi";
import { metrics as fallbackMetrics } from "../../data/mockDashboard";
import { StatCard } from "../ui/StatCard";
import { staggerParent } from "../../motion/transitions";

const iconMap = {
  "Today's Patients": FiUsers,
  "Patients Today": FiUsers,
  "Appointments Live": FiCalendar,
  Appointments: FiCalendar,
  "Queue Waiting": FiUsers,
  "Consultations Completed": FiActivity,
  "Vaccinations Due": FiShield,
  "Low Stock Alerts": FiShield,
};

export function StatsGrid({ metrics = fallbackMetrics }) {
  return (
    <motion.section
      animate="visible"
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      initial="hidden"
      variants={staggerParent}
    >
      {metrics.map((metric) => (
        <StatCard
          accent={metric.accent}
          detail={metric.detail}
          icon={iconMap[metric.label]}
          key={metric.label}
          label={metric.label}
          value={metric.value}
        />
      ))}
    </motion.section>
  );
}
