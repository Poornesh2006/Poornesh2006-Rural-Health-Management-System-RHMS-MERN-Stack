import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { FiBell, FiChevronDown, FiClock, FiCommand, FiMenu, FiSearch, FiSidebar } from "react-icons/fi";
import { Input } from "../ui/Input";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Button } from "../ui/Button";
import { ProfileMenu } from "./ProfileMenu";
import { NotificationPanel } from "./NotificationPanel";
import { CommandPalette } from "../ui/CommandPalette";
import { useAuth } from "../../context/AuthContext";
import { ConnectivityStatus } from "./ConnectivityStatus";
import { FacilitySwitcher } from "./FacilitySwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

export function Header({ onOpenMobileNav, onToggleSidebar }) {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const breadcrumbs = useMemo(() => getBreadcrumbs(location.pathname, t), [location.pathname, t]);
  const title = useMemo(() => breadcrumbs.at(-1)?.label || t("header.titleHome"), [breadcrumbs, t]);

  const locale = i18n.language === "ta" ? "ta-IN" : "en-IN";

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(now),
    [locale, now],
  );

  const formattedTime = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }).format(now),
    [locale, now],
  );

  return (
    <>
      <header className="relative flex flex-col gap-4 border-b border-[var(--color-border)] px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 lg:hidden">
                <Button aria-label="Open navigation" onClick={onOpenMobileNav} size="icon" type="button" variant="secondary">
                  <FiMenu size={18} />
                </Button>
              </div>
              <div className="hidden lg:flex">
                <Button aria-label="Toggle sidebar" onClick={onToggleSidebar} size="icon" type="button" variant="secondary">
                  <FiSidebar size={18} />
                </Button>
              </div>
              <p className="text-sm font-medium text-[var(--color-brand)]">{formattedDate}</p>
              <div className="glass-panel flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-foreground-muted)]">
                <FiClock size={14} />
                <span>{formattedTime}</span>
              </div>
              <div className="hidden md:block">
                <ConnectivityStatus />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-[var(--color-foreground-muted)]">
                {breadcrumbs.map((item) => item.label).join(" / ")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{title}</h2>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <div className="flex w-full flex-col gap-3 md:flex-row md:items-center xl:justify-end">
              <div className="w-full md:w-80">
                <Input icon={FiSearch} placeholder={t("header.searchPlaceholder")} type="search" />
              </div>
              <Button onClick={() => setShowCommandPalette(true)} size="icon" type="button" variant="secondary">
                <FiCommand size={18} />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              <div className="md:hidden">
                <ConnectivityStatus />
              </div>
              <FacilitySwitcher />
              <LanguageSwitcher />
              <ThemeToggle />
              <div className="relative">
                <Button onClick={() => setShowNotifications((current) => !current)} size="icon" type="button" variant="secondary">
                  <FiBell size={18} />
                </Button>
                {showNotifications ? <div className="absolute right-0 top-14 z-20"><NotificationPanel /></div> : null}
              </div>
              <div className="relative">
                <Button className="max-w-[18rem] px-4" onClick={() => setShowProfile((current) => !current)} size="md" type="button" variant="secondary">
                  <span className="truncate">{user?.fullName || "District Admin"}</span>
                  <FiChevronDown size={16} />
                </Button>
                {showProfile ? <div className="absolute right-0 top-14 z-20"><ProfileMenu /></div> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-foreground-muted)]">
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1">{user?.role || t("header.roleFallback")}</span>
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1">{t("common.secureAccess")}</span>
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1">{t("common.offlineSync")}</span>
        </div>
      </header>
      <CommandPalette onClose={setShowCommandPalette} open={showCommandPalette} />
    </>
  );
}
