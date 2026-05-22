import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Link2, FolderKanban, ArrowUpRight } from "lucide-react";

export default function HomeHub() {
  const navigate = useNavigate();

  //Enhanced Enterprise Gradient Palette Matrix Mapping
  const hubs = [
    {
      title: "Text to Audio",
      path: "/text-to-audio",
      icon: <FileText className="w-8 h-8 text-cyan-400" />,
      // High contrast deep neon ambient glow profiles
      color:
        "from-cyan-500/25 via-blue-600/10 to-transparent hover:border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.15)]",
    },
    {
      title: "URL to Audio",
      path: "/url-to-audio",
      icon: <Link2 className="w-8 h-8 text-purple-400" />,
      color:
        "from-purple-500/25 via-indigo-600/10 to-transparent hover:border-purple-400/50 shadow-[0_0_30px_rgba(192,132,252,0.15)]",
    },
    {
      title: "Docs to Audio",
      path: "/doc-to-audio",
      icon: <FolderKanban className="w-8 h-8 text-emerald-400" />,
      color:
        "from-emerald-500/25 via-teal-600/10 to-transparent hover:border-emerald-400/50 shadow-[0_0_30px_rgba(52,211,153,0.15)]",
    },
  ];

  return (
    <div className="space-y-8 py-6 select-none">
      <div>
        <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Workspace Dashboard
        </h2>
      </div>

      {/* Grid Platform Layout Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
        {hubs.map((hub, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.04, y: -6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(hub.path)}
            className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/40 p-8 min-h-[220px] flex flex-col justify-between cursor-pointer group transition-all duration-300 backdrop-blur-xl ${hub.color}`}
          >
            {/* Top Row: Enlarged Asset Badges */}
            <div className="flex items-start justify-between w-full">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
                {hub.icon}
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 group-hover:text-white transition-all">
                <ArrowUpRight className="w-6 h-6 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </div>
            </div>

            {/* Bottom Row: Streamlined Punchy Typography Headline */}
            <div className="mt-8">
              <h3 className="text-2xl font-black tracking-tight text-white transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text">
                {hub.title}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
