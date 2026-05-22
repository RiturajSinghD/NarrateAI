import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function AuthModal({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Authentication failed.");

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ name: data.name, email: data.email }),
      );
      onLoginSuccess();
    } catch (err) {
      setError(
        err.message || "Could not connect to the authentication server.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl text-white z-10"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <img
              src="/favicon.ico"
              alt="NarrateAI Brand Logo"
              className="w-10 h-10 object-contain filter drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            />
          </div>
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            {isLogin ? "NarrateAI" : "Join NarrateAI"}
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-[260px] leading-relaxed">
            {isLogin
              ? "Sign in to access your dashboard workspace."
              : "Create an account to begin transforming documents."}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3.5 mb-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5 pl-1">
                Full Name
              </label>
              <input
                type="text"
                required
                disabled={loading}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-white disabled:opacity-50"
              />
            </motion.div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5 pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                disabled={loading}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 pl-11 rounded-xl bg-white/5 border border-white/10 text-sm placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-white disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5 pl-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                disabled={loading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 pl-11 rounded-xl bg-white/5 border border-white/10 text-sm placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-white disabled:opacity-50"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] shadow-md flex items-center justify-center gap-2 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Authenticating..."
              : isLogin
                ? "Sign In to Workspace"
                : "Register Account"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 border-t border-white/5 pt-4">
          {isLogin ? "New to NarrateAI?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              if (!loading) {
                setIsLogin(!isLogin);
                setError("");
              }
            }}
            className="text-cyan-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer outline-none disabled:opacity-50"
          >
            {isLogin ? "Create an account" : "Sign in instead"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
