import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./components/auth/RouteGuards";
import { AppShell } from "./layouts/AppShell";
import { AppointmentsPage } from "./pages/appointments/AppointmentsPage";
import { QueuePage } from "./pages/appointments/QueuePage";
import { WaitingQueuePage } from "./pages/appointments/WaitingQueuePage";
import { AnalyticsPage } from "./pages/analytics/AnalyticsPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { DoctorDashboardPage } from "./pages/doctors/DoctorDashboardPage";
import { LaboratoryPage } from "./pages/laboratory/LaboratoryPage";
import { AiGovernancePage } from "./pages/system/AiGovernancePage";
import { AboutProjectPage } from "./pages/system/AboutProjectPage";
import { DevicesPage } from "./pages/system/DevicesPage";
import { HelpCenterPage } from "./pages/system/HelpCenterPage";
import { NotificationsPage } from "./pages/system/NotificationsPage";
import {
  AlertCenterPage,
  CommandCenterPage,
  DocumentVerificationPage,
  FollowUpBoardPage,
  HouseholdsPage,
  PublicVerificationPage,
  ShiftHandoverPage,
} from "./pages/system/OperationsWorkbenchPage";
import { OutreachPage } from "./pages/system/OutreachPage";
import { PresentationDashboardPage } from "./pages/system/PresentationDashboardPage";
import { PlatformPage } from "./pages/system/PlatformPage";
import { ReferralsPage } from "./pages/system/ReferralsPage";
import { SettingsPage } from "./pages/system/SettingsPage";
import { NotFoundPage, AccessDeniedPage, LoadingPage } from "./pages/system/StatusPages";
import { PharmacyPage } from "./pages/pharmacy/PharmacyPage";
import {
  CalendarPage,
  RegisterPatientPage,
  VisitHistoryPage,
} from "./pages/modules/ModulePages";
import { PatientListPage } from "./pages/patients/PatientListPage";
import { PatientDetailsPage } from "./pages/patients/PatientDetailsPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { VaccinationPage } from "./pages/vaccination/VaccinationPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/access-denied",
    element: <AccessDeniedPage />,
  },
  {
    path: "/display",
    element: <WaitingQueuePage publicMode />,
  },
  {
    path: "/verify/:publicToken",
    element: <PublicVerificationPage />,
  },
  {
    path: "/loading",
    element: <LoadingPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "patients/register",
            element: <RegisterPatientPage />,
          },
          {
            path: "patients",
            element: <PatientListPage />,
          },
          {
            path: "patients/:patientId",
            element: <PatientDetailsPage />,
          },
          {
            path: "patients/visits",
            element: <VisitHistoryPage />,
          },
          {
            path: "appointments",
            element: <AppointmentsPage />,
          },
          {
            path: "appointments/calendar",
            element: <CalendarPage />,
          },
          {
            path: "appointments/queue",
            element: <QueuePage />,
          },
          {
            path: "appointments/waiting",
            element: <WaitingQueuePage />,
          },
          {
            path: "doctors",
            element: <DoctorDashboardPage />,
          },
          {
            path: "pharmacy",
            element: <PharmacyPage />,
          },
          {
            path: "laboratory",
            element: <LaboratoryPage />,
          },
          {
            path: "vaccination",
            element: <VaccinationPage />,
          },
          {
            path: "reports",
            element: <ReportsPage />,
          },
          {
            path: "analytics",
            element: <AnalyticsPage />,
          },
          {
            path: "presentation",
            element: <PresentationDashboardPage />,
          },
          {
            path: "about-project",
            element: <AboutProjectPage />,
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "help",
            element: <HelpCenterPage />,
          },
          {
            path: "platform",
            element: <PlatformPage />,
          },
          {
            path: "referrals",
            element: <ReferralsPage />,
          },
          {
            path: "ai-governance",
            element: <AiGovernancePage />,
          },
          {
            path: "devices",
            element: <DevicesPage />,
          },
          {
            path: "outreach",
            element: <OutreachPage />,
          },
          {
            path: "operations",
            element: <CommandCenterPage />,
          },
          {
            path: "operations/households",
            element: <HouseholdsPage />,
          },
          {
            path: "operations/follow-ups",
            element: <FollowUpBoardPage />,
          },
          {
            path: "operations/handovers",
            element: <ShiftHandoverPage />,
          },
          {
            path: "operations/alerts",
            element: <AlertCenterPage />,
          },
          {
            path: "operations/verification",
            element: <DocumentVerificationPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
