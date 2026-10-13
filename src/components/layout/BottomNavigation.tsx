import React from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeftRight, Target, Bot, Plus } from 'lucide-react';

export type TabType = 'dashboard' | 'transactions' | 'goals' | 'coach';

interface BottomNavigationProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenAddModal: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onChangeTab,
  onOpenAddModal,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Inicio', icon: Home },
    { id: 'transactions' as TabType, label: 'Movimientos', icon: ArrowLeftRight },
    { id: 'goals' as TabType, label: 'Metas', icon: Target },
    { id: 'coach' as TabType, label: 'FinCoach', icon: Bot, isAgent: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40 px-4 pb-4 pt-1 pointer-events-none">
      {/* Floating Add Button in Mobile */}
      <div className="flex justify-end mb-2 pr-1 pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-medium text-xs shadow-lg shadow-indigo-500/30 border border-indigo-400/30 hover:shadow-indigo-500/50 transition-all cursor-pointer"
          aria-label="Registrar nuevo gasto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar</span>
        </motion.button>
      </div>

      {/* Modern Frosted Glass Bottom Bar */}
      <nav className="pointer-events-auto backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-1.5 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all cursor-pointer group"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className={`absolute inset-0 rounded-2xl ${
                    tab.isAgent
                      ? 'bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-emerald-500/15 border border-indigo-500/20'
                      : 'bg-indigo-50 dark:bg-indigo-950/40'
                  }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive
                      ? tab.isAgent
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${tab.isAgent && isActive ? 'animate-pulse' : ''}`} />
                </div>

                <span
                  className={`text-[10px] font-semibold tracking-tight transition-colors flex items-center gap-1 ${
                    isActive
                      ? 'text-slate-900 dark:text-white font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.label}
                  {tab.isAgent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
