import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Info,
  Layers
} from 'lucide-react';
import { useFinance } from '../../store/FinanceContext';
import { formatCOP, getCurrentWeekOfMonth } from '../../utils/formatters';

export const GoalsScreen: React.FC = () => {
  const { state, addSavings } = useFinance();

  const [simulatePrima, setSimulatePrima] = useState(false);
  const currentWeek = getCurrentWeekOfMonth();

  // Cálculo de gastos por semana para los sobres ($117.500/sem)
  const weeklyEnvelopeBudget = 117500; // $87.500 mercado + $30.000 libre

  const weeksData = [1, 2, 3, 4].map((wk) => {
    const wkTransactions = state.transactions.filter(
      (tx) => tx.weekNumber === wk && (tx.pocket === 'mercado' || tx.pocket === 'libre')
    );
    const spent = wkTransactions.reduce((acc, t) => acc + t.amount, 0);
    const groceriesSpent = wkTransactions.filter(t => t.pocket === 'mercado').reduce((a, b) => a + b.amount, 0);
    const freeSpent = wkTransactions.filter(t => t.pocket === 'libre').reduce((a, b) => a + b.amount, 0);

    return {
      week: wk,
      spent,
      groceriesSpent,
      freeSpent,
      remaining: Math.max(0, weeklyEnvelopeBudget - spent),
      isCurrent: wk === currentWeek,
      isPassed: wk < currentWeek,
    };
  });

  // Cálculo del Fondo de Emergencia
  const currentSavings = state.emergencyFundCurrent;
  const goal = state.emergencyFundGoal;
  const percentage = Math.min(100, Math.round((currentSavings / goal) * 100));

  const month1Threshold = Math.round(goal / 3);
  const month2Threshold = Math.round((goal / 3) * 2);

  // Simulación de Prima de Servicios (Colombia: mitad de un salario base = $977.000)
  const primaValue = Math.round(state.baseSalary / 2); // $977.000 COP
  const creditCardTotalOwed = state.creditCardInstallment * 2; // ~$640.000 COP
  const leftoverFromPrima = primaValue - creditCardTotalOwed; // ~$337.000 COP

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="pt-1">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Estrategia y Planificación
        </span>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Metas & Sobres Semanales
        </h1>
      </div>

      {/* 1. SECCIÓN: REGLA DE LOS SOBRES SEMANALES */}
      <div className="p-4.5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                Regla de los Sobres Semanales
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Tope: <strong>{formatCOP(weeklyEnvelopeBudget)}</strong>/semana ($87.500 mercado + $30.000 libre)
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
            4 Semanas
          </span>
        </div>

        {/* 4 Semanas Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {weeksData.map((w) => {
            const isOver = w.spent > weeklyEnvelopeBudget;
            const pct = Math.min(100, Math.round((w.spent / weeklyEnvelopeBudget) * 100));

            return (
              <div
                key={w.week}
                className={`p-3 rounded-2xl border transition-all ${
                  w.isCurrent
                    ? 'border-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Semana {w.week}
                  </span>
                  {w.isCurrent && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500 text-white">
                      ACTUAL
                    </span>
                  )}
                  {w.isPassed && (
                    <span className="text-[9px] font-semibold text-slate-400">
                      Cerrada
                    </span>
                  )}
                </div>

                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {formatCOP(w.spent)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isOver
                    ? `Exceso: -${formatCOP(w.spent - weeklyEnvelopeBudget)}`
                    : `Disponible: ${formatCOP(w.remaining)}`}
                </div>

                {/* Micro progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOver ? 'bg-rose-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>🛒 {formatCOP(w.groceriesSpent, false)}</span>
                  <span>☕ {formatCOP(w.freeSpent, false)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SECCIÓN: TERMÓMETRO VISUAL DEL FONDO DE EMERGENCIA */}
      <div className="p-4.5 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500 text-slate-950">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">
                Termómetro del Fondo de Emergencia
              </h2>
              <p className="text-[10px] text-emerald-200/80">
                Blindaje ante imprevistos (3 meses de gastos mínimos)
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-base font-black text-emerald-400">{percentage}%</div>
            <div className="text-[9px] text-slate-300">completado</div>
          </div>
        </div>

        {/* Visual Thermometer Bar */}
        <div className="relative pt-2 pb-1">
          <div className="h-4 w-full rounded-full bg-slate-800 border border-slate-700/80 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-lg shadow-emerald-500/50"
            />
          </div>

          {/* Milestone markers */}
          <div className="flex justify-between text-[9px] text-slate-300 mt-2 px-0.5">
            <div className="text-left">
              <div className="font-semibold text-white">{formatCOP(0)}</div>
              <div className="text-[8px] text-slate-400">Inicio</div>
            </div>
            <div className={`text-center ${currentSavings >= month1Threshold ? 'text-emerald-400 font-bold' : ''}`}>
              <div>{formatCOP(month1Threshold, false)}</div>
              <div className="text-[8px] text-slate-400">1 Mes</div>
            </div>
            <div className={`text-center ${currentSavings >= month2Threshold ? 'text-emerald-400 font-bold' : ''}`}>
              <div>{formatCOP(month2Threshold, false)}</div>
              <div className="text-[8px] text-slate-400">2 Meses</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-emerald-400">{formatCOP(goal, false)}</div>
              <div className="text-[8px] text-slate-400">3 Meses 🏆</div>
            </div>
          </div>
        </div>

        {/* Stats card */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] text-slate-400">Acumulado actual:</div>
            <div className="font-black text-emerald-300 text-sm">{formatCOP(currentSavings)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Faltante para meta:</div>
            <div className="font-bold text-white text-sm">{formatCOP(Math.max(0, goal - currentSavings))}</div>
          </div>
        </div>

        {/* Quick Deposit Touch Chips */}
        <div>
          <span className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">
            Abono Inmediato al Fondo (Dispara Confeti):
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[50000, 100000, 200000].map((amt) => (
              <motion.button
                key={amt}
                whileTap={{ scale: 0.95 }}
                onClick={() => addSavings(amt)}
                className="py-2 px-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs border border-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>+{formatCOP(amt, false)}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN: SIMULADOR DE PAGO TOTAL DE TARJETA CON LA PRIMA */}
      <div className="p-4.5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                Simulador de Deuda & Prima de Servicios
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Proyección con la prima legal (Junio o Diciembre)
              </p>
            </div>
          </div>

          <button
            onClick={() => setSimulatePrima(!simulatePrima)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              simulatePrima
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {simulatePrima ? 'Simulado ON' : 'Simular'}
          </button>
        </div>

        {/* Breakdown Card */}
        <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Cuota actual de Tarjeta:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {formatCOP(state.creditCardInstallment)}/mes
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Saldo estimado restante (1-2 cuotas):</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatCOP(creditCardTotalOwed)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Prima legal estimada (1/2 salario):</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">
              {formatCOP(primaValue)}
            </span>
          </div>

          {simulatePrima && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 pt-3 border-t border-purple-500/20 space-y-2"
            >
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <div className="text-[11px]">
                  <strong>¡Tarjeta pagada al 100%!</strong> Liberas <strong>{formatCOP(state.creditCardInstallment)} COP mensuales</strong> de flujo libre inmediato.
                </div>
              </div>

              <div className="flex justify-between text-xs font-semibold text-slate-900 dark:text-white">
                <span>Excedente de prima para Fondo de Emergencia:</span>
                <span className="text-emerald-600 dark:text-emerald-400">+{formatCOP(leftoverFromPrima)}</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span>Al liquidar la tarjeta, tu capacidad mensual de ahorro pasa de $464.480 a $784.480 COP.</span>
        </div>
      </div>
    </div>
  );
};
