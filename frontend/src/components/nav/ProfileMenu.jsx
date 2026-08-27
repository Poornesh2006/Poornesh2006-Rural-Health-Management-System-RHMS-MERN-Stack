import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { useAuth } from "../../context/AuthContext";

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <Card className="min-w-[260px] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-brand)] font-semibold text-[var(--color-text-inverse)]">
          {(user?.fullName || "DA")
            .split(" ")
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join("")}
        </div>
        <div>
          <p className="font-semibold text-[var(--color-foreground)]">{user?.fullName || "District Admin"}</p>
          <p className="text-sm text-[var(--color-foreground-muted)]">{user?.email || "admin@rphc.gov"}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Badge tone="brand">{user?.role || "admin"}</Badge>
        <Badge tone="success">{t("common.activeSession")}</Badge>
      </div>
      <div className="mt-4 space-y-2">
        <Link className="block rounded-2xl px-3 py-2 text-sm transition hover:bg-[var(--color-surface-hover)]" to="/settings">
          {t("common.profileSettings")}
        </Link>
        <Link className="block rounded-2xl px-3 py-2 text-sm transition hover:bg-[var(--color-surface-hover)]" to="/help">
          {t("common.helpCenter")}
        </Link>
        <button
          className="block w-full rounded-2xl px-3 py-2 text-left text-sm transition hover:bg-[var(--color-surface-hover)]"
          onClick={logout}
          type="button"
        >
          {t("common.signOut")}
        </button>
      </div>
    </Card>
  );
}
