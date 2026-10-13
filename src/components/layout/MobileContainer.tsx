import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Sun, Moon, RotateCcw, Wifi, Battery, Signal } from 'lucide-react';
import { useFinance } from '../../store/FinanceContext';

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  const { state, toggleDarkMode, resetToDefault } = useFinance();
  const [deviceFrame, setDeviceFrame] = useState(true);
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-start sm:py-6 sm:px-4 transition-colors">
      {/* Desktop Top Control Bar */}
      <header className="hidden sm:flex items-center justify-between w-full max-w-[430px] mb-3 px-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>FinCoach AI • Colombia</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Device Frame */}
          <button
            onClick={() => setDeviceFrame(!deviceFrame)}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
            title={deviceFrame ? 'Cambiar a ancho extendido' : 'Cambiar a marco móvil'}
          >
            {deviceFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
            title="Alternar Modo Oscuro / Claro"
          >
            {state.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (window.confirm('¿Deseas reiniciar los datos a la configuración inicial predeterminada de Colombia?')) {
                resetToDefault();
              }
            }}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
            title="Restablecer datos demo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container / Device Chassis */}
      <div
        className={`w-full transition-all ${
          deviceFrame
            ? 'max-w-[430px] sm:rounded-[44px] sm:shadow-2xl sm:shadow-indigo-950/20 sm:border-[8px] sm:border-slate-800 dark:sm:border-slate-700/80 sm:ring-1 sm:ring-slate-900/10'
            : 'max-w-2xl sm:rounded-3xl sm:border border-slate-200 dark:border-slate-800'
        } bg-slate-50 dark:bg-slate-900 min-h-screen sm:min-h-[860px] flex flex-col relative overflow-hidden`}
      >
        {/* Simulated iOS Status Bar (Visible in Frame Mode) */}
        {deviceFrame && (
          <div className="w-full pt-3 px-6 pb-1 flex items-center justify-between text-slate-800 dark:text-slate-200 select-none z-30">
            <span className="text-xs font-bold tracking-tight">{currentTime}</span>

            {/* Dynamic Island pill */}
            <div className="w-24 h-4 rounded-full bg-slate-900 dark:bg-slate-950 flex items-center justify-center gap-1.5 px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[8px] text-slate-300 font-mono">FinCoach</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Inner Content Area */}
        <main className="flex-1 px-4 pt-2 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
