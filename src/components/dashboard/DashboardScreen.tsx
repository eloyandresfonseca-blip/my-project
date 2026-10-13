import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronDown, 
  ChevronUp, 
  Bike, 
  Bus, 
  Plus, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { useFinance } from '../../store/FinanceContext';
import { formatCOP, formatDateDisplay } from '../../utils/formatters';
import { AgentWidget } from './AgentWidget';
import { PocketCard } from './PocketCard';
import { AlertBanner } from '../common/AlertBanner';

interface DashboardScreenProps {
  onNavigateToTab: (tab: 'dashboard' | 'transactions' | 'goals' | 'coach') => void;
  onOpenAddModal: () => void;
  onTriggerAudit: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToTab,
  onOpenAddModal,
  onTriggerAudit,
}) => {
  const {
    state,
    netSalary,
    totalSpentThisMonth,
    availableCashBalance,
    monthlySurplusForSavings,
    pocketsSummary,
    toggleTransportMode,
    addSavings,
    dismissAlert,
  } = useFinance();

  const [showPayrollBreakdown, setShowPayrollBreakdown] = useState(false);

  const emergencyPercentage = Math.min(
    100,
    Math.round((state.emergencyFundCurrent / state.emergencyFundGoal) * 100)
  );

  return (
    <div className="space-y-4 pb-24">
      {/* Top Greeting & Date */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            🇨🇴 Bogotá, Colombia
          </span>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Hola, Eloy 👋
          </h1>
        </div>

        {/* Transport Mode Quick Switcher */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleTransportMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
            state.transportMode === 'hybrid'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300/60'
              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300/60'
          }`}
          title="Alternar esquema de transporte híbrido vs presencial"
        >
          {state.transportMode === 'hybrid' ? (
            <>
              <Bike className="w-4 h-4 text-emerald-600" />
              <span>Híbrido ({formatCOP(state.transportHybridCost, false)})</span>
            </>
          ) : (
            <>
              <Bus className="w-4 h-4 text-indigo-600" />
              <span>Presencial ({formatCOP(state.transportPresentialCost, false)})</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Real-time Alerts from FinCoach */}
      <AlertBanner alerts={state.activeAlerts} onDismiss={dismissAlert} />

      {/* Persistent FinCoach AI Mini-Agent Widget */}
      <AgentWidget
        onNavigateToCoach={() => onNavigateToTab('coach')}
        onAuditClick={onTriggerAudit}
      />

      {/* Main Cashflow & Available Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-5 shadow-xl shadow-indigo-600/20">
        <div className="flex items-center justify-between text-indigo-100 text-xs font-medium">
          <span>Saldo Disponible en Efectivo</span>
          <span className="bg-white/15 px-2 py-0.5 rounded-full text-[10px] backdrop-blur-sm">
            Mes en Curso
          </span>
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight">
            {formatCOP(availableCashBalance)}
          </span>
        </div>

        {/* Quick Cashflow Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/15 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-400/20 text-emerald-300">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-indigo-200">Ingreso Neto</div>
              <div className="font-bold text-white">{formatCOP(netSalary)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-rose-400/20 text-rose-300">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-indigo-200">Gastos Registrados</div>
              <div className="font-bold text-white">{formatCOP(totalSpentThisMonth)}</div>
            </div>
          </div>
        </div>

        {/* Colombian Payroll Breakdown Accordion */}
        <div className="mt-3 pt-2 border-t border-white/10">
          <button
            onClick={() => setShowPayrollBreakdown(!showPayrollBreakdown)}
            className="w-full flex items-center justify-between text-[11px] text-indigo-200 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Desglose de Nómina Oficial Colombia
            </span>
            {showPayrollBreakdown ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showPayrollBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2.5 p-3 rounded-2xl bg-black/20 text-[11px] space-y-1.5"
            >
              <div className="flex justify-between text-indigo-100">
                <span>Salario Base:</span>
                <span className="font-semibold">{formatCOP(state.baseSalary)}</span>
              </div>
              <div className="flex justify-between text-emerald-300">
                <span>+ Auxilio de Transporte Legal:</span>
                <span className="font-semibold">+{formatCOP(state.transportAllowance)}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>- Salud (4%) y Pensión (4%):</span>
                <span className="font-semibold">-{formatCOP(state.baseSalary * 0.08)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10 font-bold text-white">
                <span>Ingreso Neto a Cuenta:</span>
                <span>{formatCOP(netSalary)}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Emergency Fund Highlight Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 dark:border-emerald-500/20 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-500 text-slate-950 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Fondo de Emergencia (Meta 3 Meses)
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Meta: {formatCOP(state.emergencyFundGoal)} • Acumulado:{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {formatCOP(state.emergencyFundCurrent)}
                </strong>
              </p>
            </div>
          </div>

          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {emergencyPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${emergencyPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400"
          />
        </div>

        {/* Quick Deposit Actions */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            Excedente mensual disponible: {formatCOP(monthlySurplusForSavings)}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => addSavings(50000)}
              className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
            >
              + $50.000
            </button>
            <button
              onClick={() => addSavings(100000)}
              className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              + $100.000
            </button>
          </div>
        </div>
      </div>

      {/* The 4 Pockets Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Control de los 4 Bolsillos
          </h2>
          <button
            onClick={() => onNavigateToTab('goals')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sobres Semanales →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {pocketsSummary.map((pocket) => (
            <PocketCard
              key={pocket.id}
              pocket={pocket}
              onClick={() => onNavigateToTab('transactions')}
            />
          ))}
        </div>
      </div>

      {/* Recent Transactions Snippet */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Movimientos Recientes
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg hover:bg-indigo-100 flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>Gasto</span>
            </button>
            <button
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Ver todos →
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {state.transactions.slice(0, 4).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="text-base shrink-0">
                  {tx.isAntExpense ? '🐜' : tx.pocket === 'ahorro' ? '🛡️' : tx.pocket === 'mercado' ? '🛒' : '💸'}
                </span>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {tx.description}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span>{formatDateDisplay(tx.date)}</span>
                    <span>•</span>
                    <span className="capitalize">{tx.category}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-xs font-extrabold ${
                    tx.pocket === 'ahorro'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {tx.pocket === 'ahorro' ? '+' : '-'}{formatCOP(tx.amount)}
                </span>
                {tx.isAntExpense && (
                  <div className="text-[9px] font-bold text-amber-500">Hormiga</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
