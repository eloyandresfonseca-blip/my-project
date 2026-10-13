import React from 'react';
import { motion } from 'framer-motion';
import { Building, ShoppingCart, Coffee, ShieldCheck } from 'lucide-react';
import type { PocketSummary } from '../../types';
import { formatCOP } from '../../utils/formatters';

interface PocketCardProps {
  pocket: PocketSummary;
  onClick?: () => void;
}

export const PocketCard: React.FC<PocketCardProps> = ({ pocket, onClick }) => {
  const isAhorro = pocket.id === 'ahorro';
  const percentage = Math.min(100, Math.round((pocket.spent / pocket.budget) * 100));

  // Determine indicator color / warning
  const isOverBudget = !isAhorro && pocket.spent > pocket.budget;
  const isNearLimit = !isAhorro && percentage >= 80 && percentage < 100;

  const iconMap: Record<string, React.ReactNode> = {
    Building: <Building className="w-4 h-4 text-indigo-500" />,
    ShoppingCart: <ShoppingCart className="w-4 h-4 text-cyan-500" />,
    Coffee: <Coffee className="w-4 h-4 text-amber-500" />,
    ShieldCheck: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/50">
            {iconMap[pocket.iconName] || <Building className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {pocket.name}
            </h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {isAhorro ? 'Meta 3 Meses' : `Tope: ${formatCOP(pocket.budget)}`}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`text-xs font-extrabold ${
              isAhorro
                ? 'text-emerald-600 dark:text-emerald-400'
                : isOverBudget
                ? 'text-rose-600 dark:text-rose-400'
                : isNearLimit
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatCOP(pocket.spent)}
          </span>
          <div className="text-[10px] text-slate-400">
            {isAhorro ? `${percentage}% meta` : `${percentage}% usado`}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            backgroundColor: isOverBudget
              ? '#F43F5E'
              : isNearLimit
              ? '#F59E0B'
              : pocket.color,
          }}
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-2 text-[10px]">
        <span className="text-slate-500 dark:text-slate-400">
          {isAhorro ? 'Acumulado real' : 'Disponible:'}
        </span>
        <span
          className={`font-semibold ${
            isAhorro
              ? 'text-emerald-600 dark:text-emerald-400'
              : isOverBudget
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {isAhorro
            ? formatCOP(pocket.spent)
            : isOverBudget
            ? `Sobrepasado -${formatCOP(Math.abs(pocket.remaining))}`
            : formatCOP(pocket.remaining)}
        </span>
      </div>
    </motion.div>
  );
};
