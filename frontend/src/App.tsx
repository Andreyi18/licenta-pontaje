import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import theme from "./theme/theme";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

// pagini
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";

// tipuri
import { UserRole } from "./types";

// crearea query clientului
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minute
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* public routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />

                {/* faculty routes */}
                <Route
                  path="schedule"
                  element={
                    <ProtectedRoute roles={[UserRole.CADRU_DIDACTIC]}>
                      <div>Schedule Page - Todo</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="timesheet"
                  element={
                    <ProtectedRoute roles={[UserRole.CADRU_DIDACTIC]}>
                      <div>Timesheet Page - Todo</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="documents"
                  element={
                    <ProtectedRoute roles={[UserRole.CADRU_DIDACTIC]}>
                      <div>Documents Page - Todo</div>
                    </ProtectedRoute>
                  }
                />

                {/* secretariat routes */}
                <Route
                  path="secretariat"
                  element={
                    <ProtectedRoute
                      roles={[UserRole.SECRETARIAT, UserRole.ADMIN]}
                    >
                      <div>Secretariat Dashboard - Todo</div>
                    </ProtectedRoute>
                  }
                />

                {/* admin routes */}
                <Route
                  path="admin/users"
                  element={
                    <ProtectedRoute roles={[UserRole.ADMIN]}>
                      <div>User Management - Todo</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute roles={[UserRole.ADMIN]}>
                      <div>Settings - Todo</div>
                    </ProtectedRoute>
                  }
                />

                {/* profile routes */}
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* catch all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
