import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  function handleLanguageChange(nextLanguage) {
    i18n.changeLanguage(nextLanguage);
    window.localStorage.setItem("rhms-language", nextLanguage);
    document.documentElement.lang = nextLanguage === "ta" ? "ta" : "en";
    document.documentElement.dataset.lang = nextLanguage;
  }

  return (
    <label className="flex items-center gap-2 text-sm text-[var(--color-foreground-muted)]">
      <span>{t("common.language")}</span>
      <select
        aria-label={t("common.language")}
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-2 text-sm text-[var(--color-foreground)]"
        onChange={(event) => handleLanguageChange(event.target.value)}
        value={i18n.language}
      >
        <option value="en">{`🌐 ${t("common.english")}`}</option>
        <option value="ta">{`🌐 ${t("common.tamil")}`}</option>
      </select>
    </label>
  );
}
