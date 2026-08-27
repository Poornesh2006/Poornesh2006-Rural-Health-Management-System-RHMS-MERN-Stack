import {
  FiActivity,
  FiBell,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiCpu,
  FiDatabase,
  FiGitBranch,
  FiFileText,
  FiHelpCircle,
  FiHome,
  FiInfo,
  FiLayers,
  FiPackage,
  FiPlayCircle,
  FiPlusCircle,
  FiSearch,
  FiSmartphone,
  FiSettings,
  FiShield,
  FiTool,
  FiUsers,
} from "react-icons/fi";

export const appNavigation = [
  {
    labelKey: "navigation.patientCare",
    icon: FiUsers,
    children: [
      { labelKey: "navigation.patients", to: "/patients", icon: FiUsers },
      { labelKey: "navigation.registerPatient", to: "/patients/register", icon: FiPlusCircle },
      { labelKey: "navigation.visitHistory", to: "/patients/visits", icon: FiClipboard },
      { labelKey: "navigation.appointments", to: "/appointments", icon: FiCalendar },
      { labelKey: "navigation.queue", to: "/appointments/queue", icon: FiClipboard },
      { labelKey: "navigation.publicQueue", to: "/appointments/waiting", icon: FiUsers },
      { labelKey: "navigation.consultation", to: "/doctors", icon: FiClipboard },
    ],
  },
  {
    labelKey: "navigation.clinicalServices",
    icon: FiPackage,
    children: [
      { labelKey: "navigation.pharmacy", to: "/pharmacy", icon: FiPackage },
      { labelKey: "navigation.laboratory", to: "/laboratory", icon: FiTool },
      { labelKey: "navigation.vaccination", to: "/vaccination", icon: FiShield },
    ],
  },
  {
    labelKey: "navigation.insights",
    icon: FiActivity,
    children: [
      { labelKey: "navigation.reports", to: "/reports", icon: FiFileText },
      { labelKey: "navigation.analytics", to: "/analytics", icon: FiActivity },
      { labelKey: "navigation.villageHealth", to: "/outreach", icon: FiShield },
    ],
  },
  {
    labelKey: "navigation.operations",
    icon: FiHome,
    children: [
      { labelKey: "navigation.todayAtPhc", to: "/operations", icon: FiHome },
      { labelKey: "navigation.households", to: "/operations/households", icon: FiLayers },
      { labelKey: "navigation.followUpBoard", to: "/operations/follow-ups", icon: FiCheckSquare },
      { labelKey: "navigation.shiftHandovers", to: "/operations/handovers", icon: FiClipboard },
      { labelKey: "navigation.alertCenter", to: "/operations/alerts", icon: FiBell },
      { labelKey: "navigation.verification", to: "/operations/verification", icon: FiSearch },
    ],
  },
  {
    labelKey: "navigation.administration",
    icon: FiSettings,
    children: [
      { labelKey: "navigation.staffRoles", to: "/doctors", icon: FiUsers },
      { labelKey: "common.notifications", to: "/notifications", icon: FiBell },
      { labelKey: "common.settings", to: "/settings", icon: FiSettings },
      { labelKey: "navigation.auditLogs", to: "/platform", icon: FiDatabase },
    ],
  },
  {
    labelKey: "navigation.support",
    icon: FiHelpCircle,
    children: [
      { labelKey: "common.helpCenter", to: "/help", icon: FiHelpCircle },
      { labelKey: "navigation.aboutProject", to: "/about-project", icon: FiInfo },
    ],
  },
];

export const quickActionLinks = [
  { labelKey: "navigation.todayAtPhc", to: "/operations", icon: FiHome },
  { labelKey: "navigation.registerPatient", to: "/patients/register", icon: FiPlusCircle },
  { labelKey: "navigation.bookAppointment", to: "/appointments", icon: FiCalendar },
  { labelKey: "navigation.generateToken", to: "/appointments/queue", icon: FiClipboard },
  { labelKey: "navigation.openQueue", to: "/appointments/waiting", icon: FiUsers },
  { labelKey: "navigation.openPharmacy", to: "/pharmacy", icon: FiPackage },
  { labelKey: "navigation.uploadLabReport", to: "/laboratory", icon: FiTool },
  { labelKey: "navigation.analytics", to: "/analytics", icon: FiActivity },
  { labelKey: "navigation.presentation", to: "/presentation", icon: FiPlayCircle },
  { labelKey: "navigation.aboutProject", to: "/about-project", icon: FiInfo },
  { labelKey: "navigation.platform", to: "/platform", icon: FiDatabase },
  { labelKey: "navigation.referrals", to: "/referrals", icon: FiGitBranch },
  { labelKey: "navigation.aiGovernance", to: "/ai-governance", icon: FiCpu },
  { labelKey: "navigation.devices", to: "/devices", icon: FiSmartphone },
  { labelKey: "navigation.outreach", to: "/outreach", icon: FiShield },
  { labelKey: "navigation.verification", to: "/operations/verification", icon: FiSearch },
  { labelKey: "navigation.reports", to: "/reports", icon: FiFileText },
  { labelKey: "common.settings", to: "/settings", icon: FiSettings },
];

export function flattenNavigation(items = appNavigation) {
  return items.flatMap((item) => (item.children ? item.children : [item]));
}
