import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import { useFinance } from '../../store/FinanceContext';
import { getDashboardAgentGreeting } from '../../utils/aiEngine';
import { formatCOP } from '../../utils/formatters';

interface AgentWidgetProps {
  onNavigateToCoach: () => void;
  onAuditClick: () => void;
}

export const AgentWidget: React.FC<AgentWidgetProps> = ({
  onNavigateToCoach,
  onAuditClick,
}) => {
  const { state, antExpensesTotal, antExpensesCount } = useFinance();

  const greeting = getDashboardAgentGreeting(state);

  const moodColors = {
    good: 'from-emerald-500/20 via-teal-500/10 to-indigo-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    warning: 'from-amber-500/20 via-orange-500/10 to-rose-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
    alert: 'from-rose-500/20 via-orange-500/10 to-red-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4.5 shadow-xl shadow-indigo-950/20 border border-indigo-500/30"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top Agent Status Bar */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-indigo-400">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            {/* Live Indicator Dot */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1">
                FinCoach AI
                <Sparkles className="w-3 h-3 text-amber-400" />
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                EN VIVO
              </span>
            </div>
            <span className="text-[10px] text-indigo-200/70 font-medium">
              Mini-Agente Financiero Colombia 🇨🇴
            </span>
          </div>
        </div>

        <button
          onClick={onNavigateToCoach}
          className="text-[11px] font-semibold text-indigo-300 hover:text-white flex items-center gap-0.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <span>Chat</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dynamic Agent Greeting & Daily Status */}
      <div className={`p-3 rounded-2xl border backdrop-blur-md mb-3 bg-gradient-to-r ${moodColors[greeting.mood]}`}>
        <div className="text-xs font-bold tracking-tight">{greeting.headline}</div>
        <div className="text-xs text-slate-200 mt-0.5 leading-snug">{greeting.subtext}</div>
      </div>

      {/* Ant Expenses Detection Pill */}
      {antExpensesCount > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3 text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-sm">🐜</span>
            <span className="text-[11px] font-medium">
              <strong className="text-amber-100">{antExpensesCount} gastos hormiga</strong> detectados: {formatCOP(antExpensesTotal)}
            </span>
          </div>
          <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-bold">
            Bajo radar
          </span>
        </div>
      )}

      {/* Highlighted Touch Action: "🔍 Auditar mis Finanzas Hoy" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative z-10 pt-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAuditClick}
          className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-400/30"
        >
          <Search className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>🔍 Auditar mis Finanzas Hoy</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNavigateToCoach}
          className="w-full py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-white/10"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ver Consejos Tácticos</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
