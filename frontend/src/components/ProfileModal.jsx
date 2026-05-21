import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, User, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function ProfileModal({ onClose, onProfileUpdate }) {
  const cachedUser = JSON.parse(localStorage.getItem("user")) || {
    name: "",
    email: "",
  };

  const [name, setName] = useState(cachedUser.name);
  const [email, setEmail] = useState(cachedUser.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const payload = { name, email };
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update profile configurations.",
        );
      }

      // 🔐 Success! Sync local browser caches with new updates
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ name: data.name, email: data.email }),
      );

      setSuccess("Profile configurations updated successfully!");
      setCurrentPassword("");
      setNewPassword("");

      // Inform parent core to sync changes instantly
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md rounded-[24px] border border-white/10 bg-[#0f172a]/95 p-6 shadow-2xl backdrop-blur-2xl text-white"
      >
        {/* Header section */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
          <h3 className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Profile Configurations
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Edit Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1 pl-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl bg-white/5 border border-white/10 text-xs outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-white"
              />
            </div>
          </div>

          {/* Edit Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1 pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl bg-white/5 border border-white/10 text-xs outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-white"
              />
            </div>
          </div>

          <div className="h-px bg-white/5 my-2" />
          <p className="text-[11px] text-slate-400 pl-1 font-medium">
            Leave password fields blank if you do not want to change it.
          </p>

          {/* Current Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1 pl-1">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl bg-white/5 border border-white/10 text-xs outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1 pl-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl bg-white/5 border border-white/10 text-xs outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white"
              />
            </div>
          </div>

          {/* Submit updates button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center gap-2 transition-all text-white disabled:opacity-50"
          >
            {loading ? "Saving changes..." : "Save Settings"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
