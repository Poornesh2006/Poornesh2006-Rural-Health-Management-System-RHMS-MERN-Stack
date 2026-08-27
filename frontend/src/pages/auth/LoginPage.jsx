import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FiActivity, FiEye, FiEyeOff, FiLock, FiMail, FiShield, FiUserCheck } from "react-icons/fi";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, loading } = useAuth();
  const [formState, setFormState] = useState({
    email: "admin@rphc.gov",
    password: "Admin@123",
    rememberMe: true,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    try {
      await login(formState);
      navigate("/");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || t("login.signInFailed"));
    }
  }

  const featureCards = [
    { icon: FiUserCheck, title: t("login.roleBasedAccess"), copy: t("login.roleBasedAccessCopy") },
    { icon: FiActivity, title: t("login.liveOperations"), copy: t("login.liveOperationsCopy") },
    { icon: FiShield, title: t("login.offlineResilience"), copy: t("login.offlineResilienceCopy") },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="hero-orb left-[8%] top-[14%] h-44 w-44 bg-sky-300/40" />
      <div className="hero-orb right-[12%] top-[8%] h-52 w-52 bg-blue-400/30" />
      <div className="hero-orb bottom-[10%] left-[18%] h-56 w-56 bg-emerald-300/30" />

      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="section-hero relative overflow-hidden rounded-[2rem] p-8 text-white shadow-[0_30px_90px_rgba(15,108,189,0.24)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_30%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-white/16 text-white ring-white/20" tone="neutral">{t("login.badgeRegion")}</Badge>
              <Badge className="bg-white/16 text-white ring-white/20" tone="neutral">{t("login.badgeProduct")}</Badge>
            </div>
            <h1 className="ui-display mt-6 max-w-xl !text-white">{t("login.heroTitle")}</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/90">
              {t("login.heroDescription")}
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {featureCards.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div className="glass-panel rounded-[1.6rem] border border-white/14 p-4" initial={{ opacity: 0, y: 18 }} key={item.title} transition={{ duration: 0.35 }} whileInView={{ opacity: 1, y: 0 }}>
                    <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white/14 text-white">
                      <Icon size={20} />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/82">{item.copy}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <Card className="glass-panel w-full p-8 md:p-10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-brand)]">{t("common.secureAccess")}</p>
            <Badge tone="brand">RBAC</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-[var(--color-foreground)]">{t("login.title")}</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--color-foreground-muted)]">
            {t("login.description")}
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <Input icon={FiMail} label={t("login.email")} onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))} placeholder={t("login.emailPlaceholder")} type="email" value={formState.email} />
            <Input icon={FiLock} label={t("login.password")} onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))} placeholder={t("login.passwordPlaceholder")} type={showPassword ? "text" : "password"} value={formState.password} />
            <button className="text-sm font-medium text-[var(--color-brand)]" onClick={() => setShowPassword((current) => !current)} type="button">
              {showPassword ? <span className="inline-flex items-center gap-2"><FiEyeOff size={16} />{t("login.hidePassword")}</span> : <span className="inline-flex items-center gap-2"><FiEye size={16} />{t("login.showPassword")}</span>}
            </button>

            {errorMessage ? <p className="text-sm text-[var(--color-danger)]">{errorMessage}</p> : null}

            <Button className="w-full" size="lg" type="submit">
              {loading ? t("login.signingIn") : t("login.submit")}
            </Button>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--color-foreground-muted)]">
              <label className="flex items-center gap-2">
                <input checked={formState.rememberMe} className="rounded" onChange={(event) => setFormState((current) => ({ ...current, rememberMe: event.target.checked }))} type="checkbox" />
                <span>{t("common.rememberMe")}</span>
              </label>
              <button className="font-semibold text-[var(--color-brand)]" type="button">{t("common.forgotPassword")}</button>
            </div>

            <p className="text-sm text-[var(--color-foreground-muted)]">{t("login.demoNote")}</p>
          </form>
        </Card>
      </div>
    </div>
  );
}
