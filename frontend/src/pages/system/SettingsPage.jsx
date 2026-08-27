import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useConnectivity } from "../../context/ConnectivityContext";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { clearOfflineData, pendingCount, syncPendingMutations, lastSyncAt } = useConnectivity();
  const { themeMode, setThemeMode, reduceMotion, setReduceMotion } = useTheme();
  const [preferences, setPreferences] = useState(null);
  const [systemSettings, setSystemSettings] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [backups, setBackups] = useState([]);
  const [welcomeEnabled, setWelcomeEnabled] = useState(() => window.localStorage.getItem("rhms-welcome-enabled") !== "false");

  async function loadData() {
    const [preferenceResponse, settingsResponse, sessionsResponse, backupsResponse] = await Promise.all([
      api.get("/notifications/preferences/me"),
      api.get("/system/settings"),
      api.get("/auth/sessions"),
      user?.role === "admin" ? api.get("/system/backups") : Promise.resolve({ data: { data: [] } }),
    ]);

    setPreferences(preferenceResponse.data.data);
    setSystemSettings(settingsResponse.data.data);
    setSessions(sessionsResponse.data.data);
    setBackups(backupsResponse.data.data || []);
  }

  useEffect(() => {
    loadData().catch(() => {});
  }, []);

  if (!preferences || !systemSettings) {
    return <p className="text-sm text-[var(--color-foreground-muted)]">{t("common.loading")}</p>;
  }

  const locale = i18n.language === "ta" ? "ta-IN" : "en-IN";

  function applyLanguage(nextLanguage) {
    i18n.changeLanguage(nextLanguage);
    window.localStorage.setItem("rhms-language", nextLanguage);
    document.documentElement.lang = nextLanguage === "ta" ? "ta" : "en";
    document.documentElement.dataset.lang = nextLanguage;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs("/settings", t)}
        description={t("settings.description")}
        eyebrow={t("common.settings")}
        title={t("common.settings")}
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader eyebrow={t("common.appearance")} title={t("common.welcomeExperience")} />
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-[var(--color-border)] p-4">
              <p className="text-sm font-semibold text-[var(--color-foreground)]">{t("common.theme")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["light", "dark", "system"].map((mode) => (
                  <Button key={mode} onClick={() => setThemeMode(mode)} size="sm" type="button" variant={themeMode === mode ? "primary" : "secondary"}>
                    {t(`common.${mode}`)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] p-4">
              <p className="text-sm font-semibold text-[var(--color-foreground)]">{t("common.language")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => applyLanguage("en")} size="sm" type="button" variant={i18n.language === "en" ? "primary" : "secondary"}>{t("common.english")}</Button>
                <Button onClick={() => applyLanguage("ta")} size="sm" type="button" variant={i18n.language === "ta" ? "primary" : "secondary"}>{t("common.tamil")}</Button>
              </div>
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] p-4">
              <span>{t("common.reduceMotion")}</span>
              <input checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} type="checkbox" />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] p-4">
              <span>{t("common.showWelcome")}</span>
              <input
                checked={welcomeEnabled}
                onChange={(event) => {
                  setWelcomeEnabled(event.target.checked);
                  window.localStorage.setItem("rhms-welcome-enabled", String(event.target.checked));
                }}
                type="checkbox"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => window.dispatchEvent(new Event("rhms-replay-welcome"))} size="md" type="button" variant="secondary">
                {t("common.replayWelcome")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow={t("common.preferences")} title={t("settings.notificationPreferences")} />
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] p-4">
              <span>{t("settings.emailEnabled")}</span>
              <input checked={preferences.emailEnabled} onChange={(event) => setPreferences((current) => ({ ...current, emailEnabled: event.target.checked }))} type="checkbox" />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] p-4">
              <span>{t("settings.smsEnabled")}</span>
              <input checked={preferences.smsEnabled} onChange={(event) => setPreferences((current) => ({ ...current, smsEnabled: event.target.checked }))} type="checkbox" />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] p-4">
              <span>{t("settings.pushEnabled")}</span>
              <input checked={preferences.pushEnabled} onChange={(event) => setPreferences((current) => ({ ...current, pushEnabled: event.target.checked }))} type="checkbox" />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button onClick={async () => { await api.put("/notifications/preferences/me", preferences); await loadData(); }} size="md" type="button">
                {t("common.save")}
              </Button>
              <Button onClick={() => applyLanguage(preferences.preferredLanguage)} size="md" type="button" variant="secondary">
                {t("common.applyLanguage")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow={t("common.offline")} title={t("settings.offlineAndSync")} />
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--color-foreground-muted)]">{t("common.pendingOfflineItems")}: {new Intl.NumberFormat(locale).format(pendingCount)}</p>
            <p className="text-sm text-[var(--color-foreground-muted)]">{t("common.lastSync")}: {lastSyncAt || t("common.notYetSynchronized")}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={syncPendingMutations} size="md" type="button">{t("common.retry")}</Button>
              <Button onClick={clearOfflineData} size="md" type="button" variant="danger">{t("common.clearOfflineData")}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow={t("common.security")} title={t("settings.activeSessions")} />
          <CardContent className="space-y-3">
            {sessions.map((session) => (
              <div key={session.sessionId} className="rounded-2xl border border-[var(--color-border)] p-4">
                <p className="font-semibold text-[var(--color-foreground)]">{session.deviceName || t("common.unknownDevice")}</p>
                <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{session.userAgent}</p>
                <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">{t("common.lastSync")}: {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(session.lastActiveAt))}</p>
                <div className="mt-3 flex gap-2">
                  {!session.revokedAt ? (
                    <Button onClick={async () => { await api.delete(`/auth/sessions/${session.sessionId}`); await loadData(); }} size="sm" type="button" variant="secondary">
                      {t("common.revoke")}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
            <Button onClick={async () => { await api.post("/auth/sessions/revoke-others"); await loadData(); }} size="md" type="button" variant="ghost">
              {t("common.revokeOtherSessions")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader eyebrow={t("common.admin")} title={t("settings.backupCenter")} />
          <CardContent className="space-y-3">
            <p className="text-sm text-[var(--color-foreground-muted)]">{t("common.defaultLanguage")}: {systemSettings.languageDefaults?.defaultLanguage}</p>
            {user?.role === "admin" ? (
              <div className="space-y-3">
                <Button onClick={async () => { await api.post("/system/backups"); await loadData(); }} size="md" type="button">
                  {t("common.createBackup")}
                </Button>
                {backups.map((backup) => (
                  <div key={backup._id} className="rounded-2xl border border-[var(--color-border)] p-4">
                    <p className="font-semibold text-[var(--color-foreground)]">{backup.backupNumber}</p>
                    <p className="text-sm text-[var(--color-foreground-muted)]">{backup.status}</p>
                    <div className="mt-3">
                      <Button onClick={async () => { await api.post(`/system/backups/${backup._id}/restore-request`); await loadData(); }} size="sm" type="button" variant="secondary">
                        {t("common.requestRestore")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-foreground-muted)]">{t("common.adminOnlyBackupControls")}</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
