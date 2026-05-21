import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings, FolderHeart } from "lucide-react";

export default function UserDropdown({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Safely check storage matrix for profile initialization parameters
  const cachedUser = JSON.parse(localStorage.getItem("user")) || {
    name: "User Account",
    email: "",
  };
  const initials = cachedUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dynamic Initials Avatar Token Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white border border-white/20 hover:scale-105 transition-all outline-none cursor-pointer"
      >
        {initials || <User className="w-5 h-5" />}
      </button>

      {/* Glassmorphic Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-52 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a]/95 p-1.5 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden text-slate-700 dark:text-slate-300"
          >
            <div className="space-y-0.5">
              {/* Spoke Node 4: My Vault */}
              <button
                onClick={() => {
                  navigate("/myvault");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent text-left text-xs font-semibold hover:text-slate-900 dark:hover:text-white transition-all group cursor-pointer"
              >
                <FolderHeart className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                My Vault Storage
              </button>

              {/* Spoke Node 5: Profile Settings */}
              <button
                onClick={() => {
                  navigate("/profile");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent text-left text-xs font-semibold hover:text-slate-900 dark:hover:text-white transition-all group cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                Profile Settings
              </button>

              <div className="h-px bg-slate-200 dark:bg-white/5 my-1" />

              {/* Action Node 3: Sign Out Link */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-left text-xs font-semibold text-slate-400 hover:text-red-400 transition-all group cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
                Sign Out Account
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
