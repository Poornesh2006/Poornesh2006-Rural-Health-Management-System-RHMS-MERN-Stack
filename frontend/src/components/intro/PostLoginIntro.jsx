import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiCheckCircle } from "react-icons/fi";
import { AnimatedBrandLetters } from "./AnimatedBrandLetters";
import { IntroMedicalIcons } from "./IntroMedicalIcons";
import { IntroProgress } from "./IntroProgress";

export function PostLoginIntro({ duration, greeting, onSkip, showSuccess, statusMessage, userRole, facilityName }) {
  const reduceMotion = useReducedMotion();
  const { t } = useTranslation();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)] px-4"
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,116,144,0.32),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(5,150,105,0.18),transparent_28%)]" />
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--gradient-brand)] p-10 text-center text-white shadow-[0_30px_90px_rgba(7,89,133,0.34)]"
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.98, y: reduceMotion ? 0 : 16 }}
        exit={{ opacity: 0, scale: 1.01 }}
      >
        <button className="absolute right-5 top-5 rounded-full border border-white/18 px-3 py-1 text-sm font-medium text-white/88" onClick={onSkip} type="button">
          {t("intro.skip")}
        </button>

        <div className="absolute left-8 top-8 h-28 w-28 rounded-full bg-sky-300/20 blur-2xl" />
        <div className="absolute bottom-8 right-8 h-36 w-36 rounded-full bg-emerald-300/20 blur-2xl" />

        <AnimatedBrandLetters />
        <motion.p animate={{ opacity: 1, y: 0 }} className="mt-7 text-lg font-semibold text-white" initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} transition={{ delay: reduceMotion ? 0.1 : 2.2, duration: 0.3 }}>
          {t("intro.title")}
        </motion.p>
        <motion.div animate={{ opacity: 1, scaleX: 1 }} className="mx-auto mt-4 h-1 w-40 rounded-full bg-white/80" initial={{ opacity: 0, scaleX: 0.25 }} transition={{ delay: reduceMotion ? 0.1 : 2.4, duration: 0.28 }} />
        <motion.p animate={{ opacity: 1, y: 0 }} className="mt-5 text-2xl font-semibold text-white" initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }} transition={{ delay: reduceMotion ? 0.15 : 2.65, duration: 0.3 }}>
          {t("intro.welcome")}
        </motion.p>
        <motion.p animate={{ opacity: 1, y: 0 }} className="mt-3 text-base text-white/86" initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} transition={{ delay: reduceMotion ? 0.18 : 2.9, duration: 0.3 }}>
          {t("intro.subtitle")}
        </motion.p>
        <motion.p animate={{ opacity: 1, y: 0 }} className="mt-6 text-xl font-semibold text-white" initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }} transition={{ delay: reduceMotion ? 0.2 : 3.15, duration: 0.3 }}>
          {greeting}
        </motion.p>
        <motion.p animate={{ opacity: 1, y: 0 }} className="mt-2 text-sm text-white/82" initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} transition={{ delay: reduceMotion ? 0.24 : 3.25, duration: 0.28 }}>
          {userRole || "Staff"}{facilityName ? ` | ${facilityName}` : ""}
        </motion.p>

        <IntroMedicalIcons />
        <IntroProgress duration={duration} />

        <motion.div animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-[1.4rem] bg-white/10 px-5 py-4" initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} transition={{ delay: reduceMotion ? 0.3 : 3.35, duration: 0.3 }}>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-white/72">{t("intro.status")}</p>
          <p className="mt-2 text-xl font-semibold">{statusMessage}</p>
        </motion.div>

        {showSuccess ? (
          <motion.div animate={{ opacity: 1, scale: 1 }} className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/12 px-4 py-2 text-white" initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.9 }} transition={{ delay: reduceMotion ? 0.35 : 4.2, duration: 0.25 }}>
            <FiCheckCircle size={18} />
            <span>{t("intro.workspaceReady")}</span>
          </motion.div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
