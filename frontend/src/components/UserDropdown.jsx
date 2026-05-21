import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Sun, Moon, LogOut, Settings } from "lucide-react";
import ProfileModal from "./ProfileModal";

export default function UserDropdown({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const dropdownRef = useRef(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Retrieve cached user info safely from local storage
  const cachedUser = JSON.parse(localStorage.getItem("user")) || {
    name: "User Account",
    email: "user@example.com",
  };

  const initials = cachedUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Picture Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm tracking-wider shadow-lg hover:shadow-cyan-500/20 text-white select-none border border-white/20 transition-all duration-300 hover:scale-105 outline-none"
      >
        {initials || <User className="w-5 h-5" />}
      </button>

      {/* Floating Dropdown Card Context Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-52 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a]/95 p-1.5 shadow-2xl backdrop-blur-2xl text-slate-700 dark:text-slate-300 z-50 overflow-hidden transition-colors duration-300"
          >
            <div className="space-y-0.5">
              {/* Option 1: Profile Settings Trigger */}
              <button
                onClick={() => {
                  setShowProfileModal(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent text-left text-xs font-semibold hover:text-slate-900 dark:hover:text-white transition-all group"
              >
                <Settings className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                Profile Settings
              </button>

              {/* Option 2: Theme Toggler */}
              <button
                onClick={handleThemeToggle}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent text-left text-xs font-semibold hover:text-slate-900 dark:hover:text-white transition-all group"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                    Switch Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    Switch Dark Mode
                  </>
                )}
              </button>

              <div className="h-px bg-slate-200 dark:bg-white/5 my-1" />

              {/* Option 3: Sign Out Account */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 border border-transparent text-left text-xs font-semibold text-slate-400 hover:text-red-500 transition-all group"
              >
                <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                Sign Out Account
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal
            onClose={() => setShowProfileModal(false)}
            onProfileUpdate={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
