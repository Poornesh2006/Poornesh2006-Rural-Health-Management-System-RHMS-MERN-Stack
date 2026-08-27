import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";
import { Button } from "./Button";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { themeMode, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const icon = themeMode === "dark" ? <FiSun size={18} /> : themeMode === "light" ? <FiMoon size={18} /> : <FiMonitor size={18} />;
  const label = themeMode === "dark" ? t("common.dark") : themeMode === "light" ? t("common.light") : t("common.system");

  return (
    <Button
      aria-label={`${t("common.theme")}: ${label}`}
      onClick={toggleTheme}
      size="icon"
      title={`${t("common.theme")}: ${label}`}
      type="button"
      variant="secondary"
    >
      {icon}
    </Button>
  );
}
