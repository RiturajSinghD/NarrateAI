import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Security, Layout, and Gate Modules
import ProtectedRoute from "./components/ProtectedRoute";
import UserDropdown from "./components/UserDropdown";
import AuthModal from "./components/AuthModal";

// 5-Stage Core Blueprint Pages
import HomeHub from "./pages/HomeHub";
import TextToAudio from "./pages/TextToAudio";
import UrlToAudio from "./pages/UrlToAudio";
import DocToAudio from "./pages/DocToAudio";
import MyVault from "./pages/MyVault";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "light" ? false : true;
  });

  useEffect(() => {
    const checkTheme = () =>
      setIsDarkMode(localStorage.getItem("theme") !== "light");
    window.addEventListener("storage", checkTheme);
    return () => window.removeEventListener("storage", checkTheme);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Public Authorization Access Page Gate Layout */}
        <Route
          path="/login"
          element={
            <AuthModal
              onLoginSuccess={() => (window.location.href = "/home")}
            />
          }
        />

        {/* 🔒 Master Session Protected Engine Route */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <main
                className={`relative min-h-screen overflow-hidden py-6 px-4 font-sans transition-colors duration-500 ${
                  isDarkMode
                    ? "bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] text-white"
                    : "bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 text-slate-900"
                }`}
              >
                {/* Visual Ambient Light Auras */}
                <div
                  className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none blur-[160px] ${isDarkMode ? "bg-cyan-500/10" : "bg-cyan-500/5"}`}
                />

                <div className="relative max-w-7xl mx-auto space-y-6 z-10">
                  {/* Global Workspace Header Navbar */}
                  <div
                    className={`flex items-center justify-between border-b pb-4 transition-colors ${isDarkMode ? "border-white/10" : "border-slate-200"}`}
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => (window.location.href = "/home")}
                    >
                      <img
                        src="/favicon.ico"
                        alt="NarrateAI Brand Symbol"
                        className="w-9 h-9 object-contain"
                      />
                      <span
                        className={`text-2xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}
                      >
                        NarrateAI
                      </span>
                    </div>
                    <UserDropdown onLogout={handleLogout} />
                  </div>

                  {/* Active Page View Switch Matrix Portal */}
                  <div className="pt-2">
                    <Routes>
                      <Route path="home" element={<HomeHub />} />
                      <Route path="text-to-audio" element={<TextToAudio />} />
                      <Route path="url-to-audio" element={<UrlToAudio />} />
                      <Route path="doc-to-audio" element={<DocToAudio />} />
                      <Route path="myvault" element={<MyVault />} />
                      <Route path="profile" element={<ProfileSettingsPage />} />
                      {/* Catch-all Fallback */}
                      <Route
                        path="*"
                        element={<Navigate to="/home" replace />}
                      />
                    </Routes>
                  </div>
                </div>
              </main>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
