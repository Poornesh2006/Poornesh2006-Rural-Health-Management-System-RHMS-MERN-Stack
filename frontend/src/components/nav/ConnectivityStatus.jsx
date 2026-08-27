import { useTranslation } from "react-i18next";
import { Badge } from "../ui/Badge";
import { useConnectivity } from "../../context/ConnectivityContext";

export function ConnectivityStatus() {
  const { t, i18n } = useTranslation();
  const { isOnline, syncState, pendingCount } = useConnectivity();

  const tone = !isOnline ? "danger" : syncState === "syncing" ? "warning" : "success";
  const label = !isOnline ? t("common.offline") : syncState === "syncing" ? t("common.syncing") : t("common.online");
  const formattedCount = new Intl.NumberFormat(i18n.language === "ta" ? "ta-IN" : "en-IN").format(pendingCount || 0);

  return <Badge tone={tone}>{pendingCount ? `${label} | ${formattedCount}` : label}</Badge>;
}
