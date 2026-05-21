import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Sun, LogOut, ChevronDown, Settings, Shield } from "lucide-react";

export default function UserDropdown({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Retrieve cached user info from local storage safely
  const cachedUser = JSON.parse(localStorage.getItem("user")) || {
    name: "User Account",
    email: "user@example.com",
  };

  // Extract initials for the profile avatar token (e.g., "Aditya Verma" -> "AV")
  const initials = cachedUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  // Close dropdown automatically if clicking anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Interactive Button Hub */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 outline-none group text-left"
      >
        {/* Avatar Badge Icon Container */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs tracking-wider shadow-md text-white select-none">
          {initials || <User className="w-4 h-4" />}
        </div>

        <div className="hidden sm:flex flex-col max-w-[120px]">
          <span className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
            {cachedUser.name}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Floating Dropdown Card Context Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-white/10 bg-[#0f172a]/95 p-2 shadow-2xl backdrop-blur-2xl text-slate-300 z-50 overflow-hidden"
          >
            {/* Header Identity Display Section */}
            <div className="px-3.5 py-3 border-b border-white/5 mb-1 select-none">
              <p className="text-xs font-black tracking-wider text-cyan-400 uppercase">
                Account Profile
              </p>
              <p className="text-sm font-bold text-white mt-1 truncate">
                {cachedUser.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {cachedUser.email}
              </p>
            </div>

            {/* Menu List Nodes Layout matrix */}
            <div className="space-y-0.5">
              {/* Option 1: Profile Details Trigger */}
              <button
                onClick={() => {
                  console.log("Navigating to profile...");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 text-left text-xs font-semibold hover:text-white transition-all group"
              >
                <Settings className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                Profile Settings
              </button>

              {/* Option 2: Active Workspace Dark/Light Theme Switching Hook */}
              <button
                onClick={() => {
                  console.log("Toggling dark/light interface state theme...");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 text-left text-xs font-semibold hover:text-white transition-all group"
              >
                <Sun className="w-4 h-4 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                Interface Theme
              </button>

              <div className="h-px bg-white/5 my-1" />

              {/* Option 3: Complete Sign Out System Exiter Link */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/10 text-left text-xs font-semibold text-slate-400 hover:text-red-400 transition-all group"
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
