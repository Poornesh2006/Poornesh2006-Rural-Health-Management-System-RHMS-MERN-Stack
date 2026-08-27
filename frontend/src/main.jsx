import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from "./context/AuthContext";
import { ConnectivityProvider } from "./context/ConnectivityContext";
import { ThemeProvider, initializeTheme } from "./context/ThemeContext";
import "./i18n";
import "./index.css";

initializeTheme();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ConnectivityProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </ConnectivityProvider>
    </AuthProvider>
  </React.StrictMode>,
);
