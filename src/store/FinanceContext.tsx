import React, { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import confetti from 'canvas-confetti';
import type { FinanceState, Transaction, TransportMode, RealTimeAlert, AuditReport, ChatMessage, PocketSummary } from '../types';
import { DEFAULT_FINANCE_STATE } from './initialData';
import { calculateNetSalary, getCurrentWeekOfMonth } from '../utils/formatters';
import { evaluateTransactionRules, generateAuditReport, answerUserPrompt } from '../utils/aiEngine';

interface FinanceContextType {
  state: FinanceState;
  netSalary: number;
  currentTransportCost: number;
  fixedObligationsTotal: number;
  totalMonthlyBudget: number;
  monthlySurplusForSavings: number;
  totalSpentThisMonth: number;
  availableCashBalance: number;
  pocketsSummary: PocketSummary[];
  antExpensesTotal: number;
  antExpensesCount: number;
  addTransaction: (tx: Omit<Transaction, 'id' | 'weekNumber'>) => void;
  deleteTransaction: (id: string) => void;
  toggleTransportMode: () => void;
  addSavings: (amount: number, description?: string) => void;
  runAudit: () => AuditReport;
  dismissAlert: (id: string) => void;
  sendChatMessage: (text: string) => void;
  toggleDarkMode: () => void;
  resetToDefault: () => void;
}

const STORAGE_KEY = 'fincoach_colombia_state_v1';

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FinanceState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_FINANCE_STATE,
          ...parsed,
        };
      }
    } catch (e) {
      console.warn('Error reading localStorage state:', e);
    }
    return DEFAULT_FINANCE_STATE;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [state]);

  // Sync dark mode class on html/body
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // Cálculos derivados
  const netSalary = useMemo(() => {
    return calculateNetSalary(state.baseSalary, state.transportAllowance, state.healthPensionDeductionRate);
  }, [state.baseSalary, state.transportAllowance, state.healthPensionDeductionRate]);

  const currentTransportCost = useMemo(() => {
    return state.transportMode === 'hybrid' ? state.transportHybridCost : state.transportPresentialCost;
  }, [state.transportMode, state.transportHybridCost, state.transportPresentialCost]);

  const fixedObligationsTotal = useMemo(() => {
    return state.rent + state.utilities + state.payrollLoan + state.creditCardInstallment;
  }, [state.rent, state.utilities, state.payrollLoan, state.creditCardInstallment]);

  const totalMonthlyBudget = useMemo(() => {
    return fixedObligationsTotal + state.monthlyGroceriesBudget + currentTransportCost + (state.weeklyFreeBudget * 4);
  }, [fixedObligationsTotal, state.monthlyGroceriesBudget, currentTransportCost, state.weeklyFreeBudget]);

  const monthlySurplusForSavings = useMemo(() => {
    return Math.max(0, netSalary - totalMonthlyBudget);
  }, [netSalary, totalMonthlyBudget]);

  const totalSpentThisMonth = useMemo(() => {
    return state.transactions.reduce((sum, tx) => {
      // Excluir ahorro del gasto si se contabiliza como transferencia a reserva
      if (tx.pocket === 'ahorro') return sum;
      return sum + tx.amount;
    }, 0);
  }, [state.transactions]);

  const availableCashBalance = useMemo(() => {
    return Math.max(0, netSalary - totalSpentThisMonth);
  }, [netSalary, totalSpentThisMonth]);

  // Resumen de los 4 Bolsillos
  const pocketsSummary = useMemo<PocketSummary[]>(() => {
    const fijosSpent = state.transactions
      .filter((t) => t.pocket === 'fijos')
      .reduce((s, t) => s + t.amount, 0);

    const mercadoSpent = state.transactions
      .filter((t) => t.pocket === 'mercado')
      .reduce((s, t) => s + t.amount, 0);

    const libreSpent = state.transactions
      .filter((t) => t.pocket === 'libre')
      .reduce((s, t) => s + t.amount, 0);

    return [
      {
        id: 'fijos',
        name: 'Obligaciones Fijas',
        budget: fixedObligationsTotal + currentTransportCost,
        spent: fijosSpent,
        remaining: Math.max(0, (fixedObligationsTotal + currentTransportCost) - fijosSpent),
        color: '#6366F1', // Indigo
        iconName: 'Building',
        description: 'Arriendo, servicios, transporte, libranza y tarjeta',
      },
      {
        id: 'mercado',
        name: 'Mercado Quincenal',
        budget: state.monthlyGroceriesBudget,
        spent: mercadoSpent,
        remaining: Math.max(0, state.monthlyGroceriesBudget - mercadoSpent),
        color: '#06B6D4', // Cyan
        iconName: 'ShoppingCart',
        description: '$87.500 COP semanales distribuidos en 4 semanas',
      },
      {
        id: 'libre',
        name: 'Bolsillo Libre & Ocio',
        budget: state.weeklyFreeBudget * 4,
        spent: libreSpent,
        remaining: Math.max(0, (state.weeklyFreeBudget * 4) - libreSpent),
        color: '#F59E0B', // Amber
        iconName: 'Coffee',
        description: '$30.000 COP semanales para salidas, tintos y snacks',
      },
      {
        id: 'ahorro',
        name: 'Fondo de Emergencia',
        budget: state.emergencyFundGoal,
        spent: state.emergencyFundCurrent,
        remaining: Math.max(0, state.emergencyFundGoal - state.emergencyFundCurrent),
        color: '#10B981', // Emerald
        iconName: 'ShieldCheck',
        description: `Meta de 3 meses ($3.280.000 COP) - Guardado: $${state.emergencyFundCurrent.toLocaleString('es-CO')}`,
      },
    ];
  }, [
    state.transactions,
    fixedObligationsTotal,
    currentTransportCost,
    state.monthlyGroceriesBudget,
    state.weeklyFreeBudget,
    state.emergencyFundGoal,
    state.emergencyFundCurrent,
  ]);

  const antExpensesList = useMemo(() => {
    return state.transactions.filter(
      (tx) => tx.amount < 10000 || tx.isAntExpense || tx.category === 'Café y Snacks'
    );
  }, [state.transactions]);

  const antExpensesTotal = useMemo(() => {
    return antExpensesList.reduce((sum, tx) => sum + tx.amount, 0);
  }, [antExpensesList]);

  const antExpensesCount = antExpensesList.length;

  // Acciones
  const addTransaction = (txData: Omit<Transaction, 'id' | 'weekNumber'>) => {
    const txDate = new Date(txData.date || new Date().toISOString());
    const weekNumber = getCurrentWeekOfMonth(txDate);
    
    // Auto-detectar gasto hormiga si es menor a $10.000 y en ocio/café
    const isAntExpense = txData.isAntExpense !== undefined 
      ? txData.isAntExpense 
      : (txData.amount < 10000 && (txData.pocket === 'libre' || txData.category === 'Café y Snacks'));

    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      weekNumber,
      isAntExpense,
    };

    // Evaluar reglas de FinCoach
    const { alerts, shouldTriggerConfetti } = evaluateTransactionRules(newTx, state);

    if (shouldTriggerConfetti) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#6366F1', '#F59E0B'],
      });
    }

    setState((prev) => {
      let updatedSavings = prev.emergencyFundCurrent;
      if (newTx.pocket === 'ahorro' || newTx.category === 'Fondo de Emergencia') {
        updatedSavings += newTx.amount;
      }

      return {
        ...prev,
        emergencyFundCurrent: updatedSavings,
        transactions: [newTx, ...prev.transactions],
        activeAlerts: [...alerts, ...prev.activeAlerts],
      };
    });
  };

  const deleteTransaction = (id: string) => {
    setState((prev) => {
      const txToDelete = prev.transactions.find((t) => t.id === id);
      let updatedSavings = prev.emergencyFundCurrent;
      if (txToDelete && (txToDelete.pocket === 'ahorro' || txToDelete.category === 'Fondo de Emergencia')) {
        updatedSavings = Math.max(0, updatedSavings - txToDelete.amount);
      }

      return {
        ...prev,
        emergencyFundCurrent: updatedSavings,
        transactions: prev.transactions.filter((t) => t.id !== id),
      };
    });
  };

  const toggleTransportMode = () => {
    setState((prev) => {
      const newMode: TransportMode = prev.transportMode === 'hybrid' ? 'presential' : 'hybrid';
      const costDiff = prev.transportPresentialCost - prev.transportHybridCost;
      
      const newAlert: RealTimeAlert = {
        id: `transport-alert-${Date.now()}`,
        type: newMode === 'hybrid' ? 'congrats' : 'warning',
        title: newMode === 'hybrid' ? '🚲 Modo Híbrido Activado' : '🚌 Modo 100% Presencial Activado',
        message: newMode === 'hybrid'
          ? `¡Excelente! Ahorras $${costDiff.toLocaleString('es-CO')} COP mensuales en transporte que puedes destinar a tu meta de ahorro.`
          : `El transporte 100% presencial incrementa tu gasto mensual en $${costDiff.toLocaleString('es-CO')} COP ($192.400 COP total). FinCoach ajustará tu disponible.`,
        timestamp: new Date().toISOString(),
      };

      return {
        ...prev,
        transportMode: newMode,
        activeAlerts: [newAlert, ...prev.activeAlerts],
      };
    });
  };

  const addSavings = (amount: number, description = 'Aporte extraordinario al Fondo de Emergencia') => {
    addTransaction({
      description,
      amount,
      date: new Date().toISOString(),
      pocket: 'ahorro',
      category: 'Fondo de Emergencia',
      notes: 'Transferido desde botón de acción rápida',
    });
  };

  const runAudit = (): AuditReport => {
    const report = generateAuditReport(state);
    setState((prev) => ({
      ...prev,
      lastAudit: report,
    }));
    return report;
  };

  const dismissAlert = (id: string) => {
    setState((prev) => ({
      ...prev,
      activeAlerts: prev.activeAlerts.filter((a) => a.id !== id),
    }));
  };

  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    // Generar respuesta con inteligencia financiera
    const agentResponseText = answerUserPrompt(text, state);
    const agentMsg: ChatMessage = {
      id: `agt-${Date.now() + 1}`,
      sender: 'agent',
      text: agentResponseText,
      timestamp: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, userMsg, agentMsg],
    }));
  };

  const toggleDarkMode = () => {
    setState((prev) => ({
      ...prev,
      darkMode: !prev.darkMode,
    }));
  };

  const resetToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_FINANCE_STATE);
  };

  return (
    <FinanceContext.Provider
      value={{
        state,
        netSalary,
        currentTransportCost,
        fixedObligationsTotal,
        totalMonthlyBudget,
        monthlySurplusForSavings,
        totalSpentThisMonth,
        availableCashBalance,
        pocketsSummary,
        antExpensesTotal,
        antExpensesCount,
        addTransaction,
        deleteTransaction,
        toggleTransportMode,
        addSavings,
        runAudit,
        dismissAlert,
        sendChatMessage,
        toggleDarkMode,
        resetToDefault,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
