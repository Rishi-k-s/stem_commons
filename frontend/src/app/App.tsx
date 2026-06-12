import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { ResourcesPage } from "../pages/ResourcesPage";
import { ResourceDetail } from "../pages/ResourceDetail";
import { MapPage } from "../pages/MapPage";
import { LoginPage } from "../pages/LoginPage";
import { AdminDashboard } from "../pages/AdminDashboard";
import { OwnerDashboard } from "../pages/OwnerDashboard";
import { SubmitResource } from "../pages/SubmitResource";
import { AuthProvider } from "../context/AuthContext";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resource/:id" element={<ResourceDetail />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/submit" element={<SubmitResource />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner"
            element={
              <ProtectedRoute roles={["Verified Owner", "Admin"]}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

