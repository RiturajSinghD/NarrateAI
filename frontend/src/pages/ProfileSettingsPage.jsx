import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function ProfileSettingsPage() {
  const navigate = useNavigate();

  // Safely parse active profile configuration tokens from session cache memory
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
      if (!response.ok)
        throw new Error(data.error || "Failed to update profile records.");

      // Synchronize local storage state caches with newly validated server tokens
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ name: data.name, email: data.email }),
      );

      setSuccess("Account profile updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-2">
      {/* Structural Nesting back navigation linkage */}
      <button
        onClick={() => navigate("/home")}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-transparent border-none outline-none cursor-pointer transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Dashboard Hub
      </button>

      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">
          Profile Configurations
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage and update your account registration profile credentials.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form
        onSubmit={handleUpdateProfile}
        className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
      >
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5 pl-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3.5 pl-11 rounded-xl bg-slate-900/40 border border-white/10 text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5 pl-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 pl-11 rounded-xl bg-slate-900/40 border border-white/10 text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        <div className="h-px bg-white/5 my-2" />

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1.5 pl-1">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3.5 pl-11 rounded-xl bg-slate-900/40 border border-white/10 text-xs text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1.5 pl-1">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3.5 pl-11 rounded-xl bg-slate-900/40 border border-white/10 text-xs text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white transition-all cursor-pointer"
        >
          {loading ? "Saving Records..." : "Update Profile Records"}
        </motion.button>
      </form>
    </div>
  );
}
