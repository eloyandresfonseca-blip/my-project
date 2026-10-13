import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X, Zap } from 'lucide-react';
import type { RealTimeAlert } from '../../types';

interface AlertBannerProps {
  alerts: RealTimeAlert[];
  onDismiss: (id: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-2 my-2">
      <AnimatePresence>
        {alerts.slice(0, 3).map((alert) => {
          const isWarning = alert.type === 'warning';
          const isCongrats = alert.type === 'congrats';
          const isDanger = alert.type === 'danger';

          let bgClass = 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200';
          let iconColor = 'text-amber-500';
          let Icon = AlertTriangle;

          if (isCongrats) {
            bgClass = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-900 dark:text-emerald-200';
            iconColor = 'text-emerald-500';
            Icon = CheckCircle;
          } else if (isDanger) {
            bgClass = 'bg-rose-500/15 border-rose-500/30 text-rose-900 dark:text-rose-200';
            iconColor = 'text-rose-500';
            Icon = Zap;
          } else if (!isWarning) {
            bgClass = 'bg-cyan-500/10 border-cyan-500/30 text-cyan-900 dark:text-cyan-200';
            iconColor = 'text-cyan-500';
            Icon = Info;
          }

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`relative flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-md shadow-sm ${bgClass}`}
            >
              <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-6">
                <h4 className="text-xs font-bold tracking-wide uppercase">{alert.title}</h4>
                <p className="text-xs mt-0.5 leading-relaxed font-normal opacity-90">{alert.message}</p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(alert.id)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1"
                aria-label="Cerrar alerta"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
