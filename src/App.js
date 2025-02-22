import {
  Container,
  Box,
  CssBaseline,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ExpenseProvider } from "./context/ExpenseContext";
import { CustomThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./components/Dashboard";
import ExpenseList from "./components/ExpenseList";
import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";
import Budget from "./components/Budget";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ResetPassword from "./components/ResetPassword";
import Profile from "./components/Profile";
import QuickStartGuide from "./components/QuickStartGuide";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage";
import SharedWallet from "./components/SharedWallet";
import { useState } from "react";

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <Box
              sx={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: "background.default",
              }}
            >
              <Sidebar
                mobileOpen={mobileOpen}
                onDrawerToggle={handleDrawerToggle}
              />
              <ThemeToggle />
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  width: { sm: `calc(100% - ${isMobile ? 0 : 80}px)` },
                  ml: { sm: `${isMobile ? 0 : 80}px` },
                  mt: { xs: "56px", sm: 0 }, // Add top margin for mobile app bar
                  p: { xs: 2, sm: 3 },
                }}
              >
                <Container
                  maxWidth="lg"
                  sx={{
                    px: { xs: 1, sm: 2, md: 3 },
                  }}
                >
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/expenses" element={<ExpenseList />} />
                    <Route path="/budget" element={<Budget />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/guide" element={<QuickStartGuide />} />
                    <Route
                      path="/shared-wallets/*"
                      element={<SharedWallet />}
                    />
                  </Routes>
                </Container>
              </Box>
            </Box>
          </ProtectedRoute>
        }
      />

      {/* Catch all route - redirect to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <HashRouter basename="">
        <AuthProvider>
          <ExpenseProvider>
            <AppContent />
          </ExpenseProvider>
        </AuthProvider>
      </HashRouter>
    </CustomThemeProvider>
  );
}

export default App;
